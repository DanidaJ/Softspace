import uvicorn
import os

if __name__ == "__main__":
    # Only enable reload in development
    is_dev = os.getenv("ENVIRONMENT", "production") == "development"
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=is_dev)
