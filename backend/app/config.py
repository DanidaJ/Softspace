from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    supabase_service_role_key: str
    gemini_api_key: str
    groq_api_key: str
    mistral_api_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()
