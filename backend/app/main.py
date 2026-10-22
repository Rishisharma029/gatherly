import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed import seed_database
from .routers import events, dashboard, tasks, budget, vendors, ai
from .security import SecurityHeadersMiddleware, RateLimitMiddleware

# Ensure DB tables exist
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables and seed initial demo data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Gatherly AI Event Planner API",
    description="Full-stack AI-powered event planning, budgeting, timeline and vendor tracking backend",
    version="1.0.0",
    lifespan=lifespan
)

# 1. Security Headers & Payload Size Limits
app.add_middleware(SecurityHeadersMiddleware)

# 2. Sliding Window Rate Limiting Protection
app.add_middleware(RateLimitMiddleware)

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"]
)

# Include routers
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(tasks.router)
app.include_router(budget.router)
app.include_router(vendors.router)
app.include_router(ai.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "Gatherly AI Event Planner",
        "security": {
            "rate_limiting": "enabled",
            "security_headers": "enabled",
            "max_body_size": "2MB"
        }
    }
