import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import mood, tasks, journal, chat, insights, therapeutic, account
from app.database import supabase_admin

app = FastAPI(title="Softspace API", version="1.0.0")

# ============================================================
# CORS CONFIGURATION
# ============================================================
# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")

# Default origins for development and production
DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Filter empty strings and combine
origins = [o.strip() for o in ALLOWED_ORIGINS if o.strip()] or DEFAULT_ORIGINS

# In development, you might want to allow all origins
# Default to production for security - must explicitly set ENVIRONMENT=development
if os.getenv("ENVIRONMENT", "production") == "development":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "X-Timezone"],
)

# ============================================================
# RATE LIMITING
# ============================================================
# Simple in-memory rate limiter (use Redis in production for distributed systems)

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
    
    def is_rate_limited(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int
    ) -> tuple[bool, int]:
        """
        Check if a key has exceeded the rate limit.
        Returns (is_limited, retry_after_seconds)
        """
        now = time.time()
        window_start = now - window_seconds
        
        # Clean old requests
        self.requests[key] = [t for t in self.requests[key] if t > window_start]
        
        if len(self.requests[key]) >= max_requests:
            # Calculate retry-after
            oldest_in_window = min(self.requests[key])
            retry_after = int(oldest_in_window + window_seconds - now) + 1
            return True, retry_after
        
        # Record this request
        self.requests[key].append(now)
        return False, 0
    
    def cleanup(self, max_age: int = 3600):
        """Remove entries older than max_age seconds"""
        now = time.time()
        cutoff = now - max_age
        keys_to_remove = []
        for key, timestamps in self.requests.items():
            self.requests[key] = [t for t in timestamps if t > cutoff]
            if not self.requests[key]:
                keys_to_remove.append(key)
        for key in keys_to_remove:
            del self.requests[key]

rate_limiter = RateLimiter()

# Rate limit configurations per endpoint category
RATE_LIMITS = {
    "chat": {"max_requests": 30, "window_seconds": 60},      # 30 req/min for AI chat
    "auth": {"max_requests": 5, "window_seconds": 60},        # 5 req/min for auth endpoints
    "default": {"max_requests": 100, "window_seconds": 60},   # 100 req/min default
}

def get_rate_limit_category(path: str) -> str:
    """Determine rate limit category based on path"""
    if "/chat" in path:
        return "chat"
    if "/auth" in path or "/account" in path:
        return "auth"
    return "default"

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for health checks and OPTIONS requests
    if request.url.path in ["/", "/health"] or request.method == "OPTIONS":
        return await call_next(request)
    
    # Get client identifier (IP address or user ID from token)
    client_ip = request.client.host if request.client else "unknown"
    
    # Try to get user ID from Authorization header for more accurate limiting
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        # Use a hash of the token as the key for authenticated users
        client_key = f"user:{hash(auth_header)}"
    else:
        client_key = f"ip:{client_ip}"
    
    # Get rate limit config for this endpoint
    category = get_rate_limit_category(request.url.path)
    config = RATE_LIMITS.get(category, RATE_LIMITS["default"])
    
    # Check rate limit
    is_limited, retry_after = rate_limiter.is_rate_limited(
        key=f"{client_key}:{category}",
        max_requests=config["max_requests"],
        window_seconds=config["window_seconds"]
    )
    
    if is_limited:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "Rate limit exceeded. Please slow down.",
                "retry_after": retry_after
            },
            headers={"Retry-After": str(retry_after)}
        )
    
    response = await call_next(request)
    return response

# Include routers
app.include_router(mood.router)
app.include_router(tasks.router)
app.include_router(journal.router)
app.include_router(chat.router)
app.include_router(insights.router)
app.include_router(therapeutic.router)
app.include_router(account.router)

@app.get("/")
async def root():
    return {"message": "Softspace API", "status": "running"}

@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint.
    Checks database connectivity and returns service status.
    """
    health_status = {
        "status": "healthy",
        "database": "unknown",
        "timestamp": time.time()
    }
    
    # Check database connectivity
    try:
        result = supabase_admin.table("user_profiles").select("id").limit(1).execute()
        health_status["database"] = "connected"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["database"] = "disconnected"
        health_status["database_error"] = str(e)
    
    # Periodic cleanup of rate limiter
    rate_limiter.cleanup()
    
    return health_status
