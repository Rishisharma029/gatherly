# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Architecture & Protections

Gatherly is architected with multi-layered defensive security guards:

1. **Sliding Window Rate Limiter**:
   - Enforces an IP-level bucket limiter (default 180 req/min for general API, 30 req/min for AI endpoints).
   - Responds with standard HTTP `429 Too Many Requests` along with `Retry-After` headers.

2. **Security Headers Middleware**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy`: Restricts unauthorized script execution and cross-domain asset injections.

3. **Denial of Service (DoS) Mitigation**:
   - Payload size ceiling enforced at 2MB per request (`413 Payload Too Large`).

4. **Cryptographic Token Verification**:
   - Bearer token / API Key authentication with constant-time HMAC digest matching (`hmac.compare_digest`) to prevent timing side-channel attacks.

5. **Decimal-Safe Financial Arithmetic**:
   - Zero floating-point drift: All financial balances, deposits, and category sums are strictly handled in integer paise arithmetic ($100\times \text{rupees}$).

## Reporting a Vulnerability

If you discover a security vulnerability within Gatherly, please report it privately:

1. **Do not disclose publicly** in GitHub issues or discussions.
2. Email full reproduction steps and advisory details to `security@gatherly.example.com` or create a private GitHub Security Advisory.
3. You will receive an acknowledgment within 24 hours and regular status updates.
