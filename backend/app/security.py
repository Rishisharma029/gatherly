import time
import os
import hmac
import hashlib
from typing import Dict, Tuple, Optional
from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

# Environment Configurations
API_SECRET_TOKEN = os.getenv("GATHERLY_API_TOKEN", "gatherly_dev_token_2026")
REQUIRE_AUTH = os.getenv("GATHERLY_REQUIRE_AUTH", "false").lower() in ("true", "1", "yes")
MAX_REQUEST_SIZE_BYTES = int(os.getenv("MAX_REQUEST_SIZE_BYTES", 2 * 1024 * 1024))  # 2MB limit

# 1. IN-MEMORY SLIDING WINDOW RATE LIMITER
class InMemoryRateLimiter:
    """
    Sliding window rate limiter with per-IP bucket tracking.
    Prevents brute-force, scraping, and DoS abuse.
    """
    def __init__(self, requests_per_minute: int = 120, burst_limit: int = 30):
        self.rpm = requests_per_minute
        self.burst_limit = burst_limit
        # { ip: [(timestamp)] }
        self.records: Dict[str, list] = {}
        self.last_cleanup = time.time()

    def is_allowed(self, client_ip: str, cost: int = 1) -> Tuple[bool, int, float]:
        now = time.time()
        window_start = now - 60.0

        # Periodic cleanup of expired records every 5 minutes
        if now - self.last_cleanup > 300:
            self._cleanup(now)

        if client_ip not in self.records:
            self.records[client_ip] = []

        # Filter out requests older than 60 seconds
        valid_requests = [t for t in self.records[client_ip] if t > window_start]
        self.records[client_ip] = valid_requests

        current_count = len(valid_requests)
        if current_count + cost > self.rpm:
            # Over limit
            oldest = valid_requests[0] if valid_requests else now
            retry_after = max(1.0, round(60.0 - (now - oldest), 1))
            return False, 0, retry_after

        # Record this request
        for _ in range(cost):
            self.records[client_ip].append(now)

        remaining = max(0, self.rpm - (current_count + cost))
        return True, remaining, 0.0

    def _cleanup(self, now: float):
        cutoff = now - 60.0
        keys_to_remove = []
        for ip, timestamps in self.records.items():
            fresh = [t for t in timestamps if t > cutoff]
            if not fresh:
                keys_to_remove.append(ip)
            else:
                self.records[ip] = fresh
        for k in keys_to_remove:
            del self.records[k]
        self.last_cleanup = now


# Shared rate limiter instances
global_rate_limiter = InMemoryRateLimiter(requests_per_minute=180)
ai_rate_limiter = InMemoryRateLimiter(requests_per_minute=30)  # stricter limit for AI endpoints


# 2. RATE LIMITING MIDDLEWARE
class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude static assets or health checks from strict rate limits
        if request.url.path in ("/api/health", "/docs", "/openapi.json", "/redoc"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        # Forwarded-For header for reverse proxies
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        # Check AI specific endpoints
        is_ai = "/api/ai" in request.url.path or "generate-plan" in request.url.path or "/ideas" in request.url.path
        limiter = ai_rate_limiter if is_ai else global_rate_limiter

        allowed, remaining, retry_after = limiter.is_allowed(client_ip)
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please slow down your requests.",
                    "retry_after_seconds": retry_after
                },
                headers={
                    "Retry-After": str(int(retry_after)),
                    "X-RateLimit-Limit": str(limiter.rpm),
                    "X-RateLimit-Remaining": "0"
                }
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limiter.rpm)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response


# 3. SECURITY HEADERS & REQUEST SIZE MIDDLEWARE
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Enforce Request Body Size Limit
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_REQUEST_SIZE_BYTES:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={"detail": f"Payload too large. Maximum allowed size is {MAX_REQUEST_SIZE_BYTES // (1024*1024)}MB."}
                    )
            except ValueError:
                pass

        response = await call_next(request)

        # Apply industry-standard security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https:; "
            "connect-src 'self' http://127.0.0.1:8000 http://localhost:8000;"
        )
        return response


# 4. TOKENIZATION & API AUTH GUARDS
security_bearer = HTTPBearer(auto_error=False)

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> bool:
    """
    Token authorization dependency.
    If GATHERLY_REQUIRE_AUTH=false (default for local dev/testing), permits requests.
    If GATHERLY_REQUIRE_AUTH=true, cryptographically verifies Bearer token against configured secret.
    """
    if not REQUIRE_AUTH:
        return True

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is required (Bearer token).",
            headers={"WWW-Authenticate": "Bearer"}
        )

    provided_token = credentials.credentials
    # Constant time comparison to prevent timing attacks
    if not hmac.compare_digest(provided_token.encode("utf-8"), API_SECRET_TOKEN.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired authorization token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return True
