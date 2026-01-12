from supabase import create_client, Client
from app.config import settings

# Anon client for user-facing operations (respects RLS)
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# Service client for backend operations (bypasses RLS)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

def get_db():
    return supabase
