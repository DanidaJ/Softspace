from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import TaskCreate, Task
from app.database import get_db, supabase_admin
from app.auth import get_current_user
from typing import List

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=dict)
async def create_task(task: TaskCreate, created_by: str = "user", user_id: str = Depends(get_current_user), db=Depends(get_db)):
    """Create a new task"""
    try:
        result = supabase_admin.table("tasks").insert({
            "user_id": user_id,
            "title": task.title,
            "description": task.description,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "priority": task.priority,
            "created_by": created_by,
            "completed": False
        }).execute()
        return {"success": True, "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[dict])
async def get_tasks(completed: bool = False, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    """Get user's tasks"""
    try:
        result = db.table("tasks")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("completed", completed)\
            .order("created_at", desc=True)\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{task_id}/complete", response_model=dict)
async def complete_task(task_id: int, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    """Mark task as completed"""
    try:
        result = supabase_admin.table("tasks")\
            .update({"completed": True})\
            .eq("id", task_id)\
            .eq("user_id", user_id)\
            .execute()
        return {"success": True, "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}", response_model=dict)
async def delete_task(task_id: int, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    """Delete a task"""
    try:
        result = db.table("tasks")\
            .delete()\
            .eq("id", task_id)\
            .eq("user_id", user_id)\
            .execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
