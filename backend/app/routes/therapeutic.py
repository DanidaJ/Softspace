"""
Therapeutic Memory API Routes

Provides endpoints for managing therapeutic goals and accessing memory insights.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.services.therapeutic_memory import TherapeuticMemory

router = APIRouter(prefix="/api/therapeutic", tags=["therapeutic"])


# ============================================================
# SCHEMAS
# ============================================================

class CreateGoalRequest(BaseModel):
    goal_text: str
    category: Optional[str] = None


class UpdateGoalRequest(BaseModel):
    is_active: Optional[bool] = None
    goal_text: Optional[str] = None
    category: Optional[str] = None


class ProgressNoteRequest(BaseModel):
    note: str


# ============================================================
# GOALS ENDPOINTS
# ============================================================

@router.get("/goals")
async def get_goals(user_id: str = Depends(get_current_user)):
    """Get all therapeutic goals for the current user"""
    try:
        memory = TherapeuticMemory(user_id)
        
        # Get all goals (not just active)
        from app.database import supabase_admin
        result = supabase_admin.table("therapeutic_goals")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {"goals": result.data if result.data else []}
    except Exception as e:
        print(f"Get goals error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/goals")
async def create_goal(
    request: CreateGoalRequest,
    user_id: str = Depends(get_current_user)
):
    """Create a new therapeutic goal (user-initiated only)"""
    try:
        memory = TherapeuticMemory(user_id)
        goal = await memory.add_goal(request.goal_text, request.category)
        
        if not goal:
            raise HTTPException(status_code=500, detail="Failed to create goal")
        
        return {"goal": goal, "message": "Goal created successfully"}
    except Exception as e:
        print(f"Create goal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/goals/{goal_id}")
async def update_goal(
    goal_id: int,
    request: UpdateGoalRequest,
    user_id: str = Depends(get_current_user)
):
    """Update a therapeutic goal"""
    try:
        from app.database import supabase_admin
        
        # Verify ownership
        existing = supabase_admin.table("therapeutic_goals")\
            .select("*")\
            .eq("id", goal_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        # Build update payload
        update_data = {}
        if request.is_active is not None:
            update_data["is_active"] = request.is_active
        if request.goal_text is not None:
            update_data["goal_text"] = request.goal_text
        if request.category is not None:
            update_data["category"] = request.category
        
        if not update_data:
            return {"goal": existing.data[0], "message": "No changes"}
        
        result = supabase_admin.table("therapeutic_goals")\
            .update(update_data)\
            .eq("id", goal_id)\
            .execute()
        
        return {"goal": result.data[0] if result.data else existing.data[0], "message": "Goal updated"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update goal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: int,
    user_id: str = Depends(get_current_user)
):
    """Delete a therapeutic goal"""
    try:
        from app.database import supabase_admin
        
        # Verify ownership
        existing = supabase_admin.table("therapeutic_goals")\
            .select("id")\
            .eq("id", goal_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        supabase_admin.table("therapeutic_goals")\
            .delete()\
            .eq("id", goal_id)\
            .execute()
        
        return {"message": "Goal deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete goal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/goals/{goal_id}/progress")
async def add_progress_note(
    goal_id: int,
    request: ProgressNoteRequest,
    user_id: str = Depends(get_current_user)
):
    """Add a progress note to a goal"""
    try:
        from app.database import supabase_admin
        from datetime import datetime
        
        # Verify ownership
        existing = supabase_admin.table("therapeutic_goals")\
            .select("*")\
            .eq("id", goal_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        goal = existing.data[0]
        notes = goal.get("progress_notes") or []
        notes.append(f"[{datetime.utcnow().strftime('%Y-%m-%d')}] {request.note}")
        
        result = supabase_admin.table("therapeutic_goals")\
            .update({"progress_notes": notes})\
            .eq("id", goal_id)\
            .execute()
        
        return {"goal": result.data[0] if result.data else goal, "message": "Progress note added"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Add progress note error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# MEMORY INSIGHTS ENDPOINTS
# ============================================================

@router.get("/themes")
async def get_recurring_themes(user_id: str = Depends(get_current_user)):
    """Get recurring themes from past conversations"""
    try:
        memory = TherapeuticMemory(user_id)
        themes = await memory.get_recurring_themes(min_mentions=2, limit=10)
        return {"themes": themes}
    except Exception as e:
        print(f"Get themes error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/progress")
async def get_emotional_progress(
    days: int = 30,
    user_id: str = Depends(get_current_user)
):
    """Get emotional progress summary (gentle framing)"""
    try:
        memory = TherapeuticMemory(user_id)
        progress = await memory.get_emotional_progress(days=days)
        return {"progress": progress}
    except Exception as e:
        print(f"Get progress error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/moments")
async def get_significant_moments(
    limit: int = 10,
    user_id: str = Depends(get_current_user)
):
    """Get significant therapeutic moments (breakthroughs, insights)"""
    try:
        memory = TherapeuticMemory(user_id)
        moments = await memory.get_significant_moments(limit=limit)
        return {"moments": moments}
    except Exception as e:
        print(f"Get moments error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/context")
async def get_full_therapeutic_context(user_id: str = Depends(get_current_user)):
    """Get full therapeutic context (for debugging/insights page)"""
    try:
        memory = TherapeuticMemory(user_id)
        context = await memory.build_therapeutic_context()
        return {"context": context}
    except Exception as e:
        print(f"Get context error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
