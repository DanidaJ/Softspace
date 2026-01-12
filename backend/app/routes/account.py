"""
Account management routes.

Exposes account deletion and data export functionality using the
Supabase service role client.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime
import json

from app.auth import get_current_user
from app.database import supabase_admin

router = APIRouter(prefix="/api/account", tags=["account"])


@router.delete("", status_code=status.HTTP_200_OK)
async def delete_account(user_id: str = Depends(get_current_user)):
    """Delete the current user's account and associated data."""
    try:
        supabase_admin.auth.admin.delete_user(user_id)
        return {"message": "Account deleted successfully"}
    except Exception as exc:
        print(f"Delete account error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account",
        )


@router.get("/export", status_code=status.HTTP_200_OK)
async def export_user_data(user_id: str = Depends(get_current_user)):
    """
    Export all user data in a downloadable JSON format.
    Returns all conversations, journals, mood logs, tasks, and goals.
    """
    try:
        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "data": {}
        }
        
        # Export chat sessions and conversations
        try:
            print(f"Exporting data for user: {user_id}")
            sessions = supabase_admin.table("chat_sessions")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            print(f"Found {len(sessions.data or [])} sessions")
            
            sessions_data = []
            for session in (sessions.data or []):
                # Get messages for each session - select all columns to avoid schema mismatch
                messages = supabase_admin.table("conversations")\
                    .select("*")\
                    .eq("session_id", session["id"])\
                    .eq("user_id", user_id)\
                    .order("created_at", desc=False)\
                    .execute()
                
                # Clean up internal fields from export
                session_export = {k: v for k, v in session.items() if k != 'user_id'}
                session_export["messages"] = [
                    {k: v for k, v in msg.items() if k not in ['user_id', 'id', 'session_id']}
                    for msg in (messages.data or [])
                ]
                sessions_data.append(session_export)
            
            export_data["data"]["chat_sessions"] = sessions_data
        except Exception as e:
            print(f"Export chat sessions error: {e}")
            export_data["data"]["chat_sessions"] = []
        
        # Export journal entries
        try:
            journals = supabase_admin.table("journals")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            export_data["data"]["journal_entries"] = [
                {k: v for k, v in j.items() if k != 'user_id'}
                for j in (journals.data or [])
            ]
        except Exception as e:
            print(f"Export journals error: {e}")
            export_data["data"]["journal_entries"] = []
        
        # Export mood logs
        try:
            moods = supabase_admin.table("mood_logs")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("timestamp", desc=True)\
                .execute()
            export_data["data"]["mood_logs"] = [
                {k: v for k, v in m.items() if k != 'user_id'}
                for m in (moods.data or [])
            ]
        except Exception as e:
            print(f"Export mood logs error: {e}")
            export_data["data"]["mood_logs"] = []
        
        # Export tasks
        try:
            tasks = supabase_admin.table("tasks")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            export_data["data"]["tasks"] = [
                {k: v for k, v in t.items() if k != 'user_id'}
                for t in (tasks.data or [])
            ]
        except Exception as e:
            print(f"Export tasks error: {e}")
            export_data["data"]["tasks"] = []
        
        # Export growth plans
        try:
            plans = supabase_admin.table("growth_plans")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            
            plans_data = []
            for plan in (plans.data or []):
                # Get tasks for each plan
                plan_tasks = supabase_admin.table("plan_tasks")\
                    .select("*")\
                    .eq("plan_id", plan.get("id"))\
                    .order("day_number", desc=False)\
                    .execute()
                plan_export = {k: v for k, v in plan.items() if k != 'user_id'}
                plan_export["tasks"] = [
                    {k: v for k, v in pt.items() if k not in ['user_id', 'plan_id']}
                    for pt in (plan_tasks.data or [])
                ]
                plans_data.append(plan_export)
            
            export_data["data"]["growth_plans"] = plans_data
        except Exception as e:
            print(f"Export growth plans error: {e}")
            export_data["data"]["growth_plans"] = []
        
        # Export therapeutic goals
        try:
            goals = supabase_admin.table("therapeutic_goals")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            export_data["data"]["therapeutic_goals"] = [
                {k: v for k, v in g.items() if k != 'user_id'}
                for g in (goals.data or [])
            ]
        except Exception as e:
            print(f"Export therapeutic goals error: {e}")
            export_data["data"]["therapeutic_goals"] = []
        
        # Export emotion logs
        try:
            emotions = supabase_admin.table("emotion_logs")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("timestamp", desc=True)\
                .execute()
            export_data["data"]["emotion_logs"] = [
                {k: v for k, v in e.items() if k != 'user_id'}
                for e in (emotions.data or [])
            ]
        except Exception as e:
            print(f"Export emotion logs error: {e}")
            export_data["data"]["emotion_logs"] = []
        
        return export_data
        
    except Exception as exc:
        print(f"Export data error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export data",
        )
