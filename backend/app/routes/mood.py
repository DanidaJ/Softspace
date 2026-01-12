from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import MoodLogCreate, MoodLog
from app.database import get_db, supabase_admin
from app.auth import get_current_user
from app.services.ai_service import log_emotion
from typing import List

router = APIRouter(prefix="/mood", tags=["mood"])

@router.post("/log", response_model=dict)
async def log_mood(
    mood: MoodLogCreate, 
    user_id: str = Depends(get_current_user), 
    db=Depends(get_db)
):
    """Log user's mood with emotion tracking"""
    try:
        # Build mood data - only include fields that exist in table
        mood_data = {
            "user_id": user_id,
            "score": mood.score,
            "triggers": mood.triggers,
            "notes": mood.notes
        }
        
        # Try to include optional fields (graceful degradation if columns don't exist)
        try:
            # Test if energy column exists
            test = supabase_admin.table("mood_logs").select("energy").limit(1).execute()
            mood_data["energy"] = mood.energy
            mood_data["stress"] = mood.stress
        except:
            pass  # Columns don't exist yet, skip them
        
        result = supabase_admin.table("mood_logs").insert(mood_data).execute()
        
        mood_id = result.data[0]["id"] if result.data else None
        
        # Map mood score to emotion
        if mood.score >= 8:
            primary_emotion = "happy"
        elif mood.score >= 6:
            primary_emotion = "content"
        elif mood.score >= 4:
            primary_emotion = "neutral"
        elif mood.score >= 2:
            primary_emotion = "sad"
        else:
            primary_emotion = "distressed"
        
        # Log emotion for analytics (graceful failure)
        try:
            await log_emotion(
                user_id=user_id,
                source="mood-log",
                source_id=mood_id,
                emotion_data={
                    "primary_emotion": primary_emotion,
                    "mood_score": mood.score,
                    "sentiment": "positive" if mood.score >= 6 else "negative" if mood.score <= 4 else "neutral",
                    "intensity": mood.score,
                    "triggers": [mood.triggers] if mood.triggers else []
                }
            )
        except Exception as e:
            print(f"Emotion log failed (non-critical): {e}")
        
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[dict])
async def get_mood_history(limit: int = 30, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    """Get mood history for analytics"""
    try:
        result = db.table("mood_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends", response_model=dict)
async def get_mood_trends(days: int = 7, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    """Calculate mood trends"""
    try:
        result = db.table("mood_logs")\
            .select("score, timestamp")\
            .eq("user_id", user_id)\
            .gte("timestamp", f"now() - interval '{days} days'")\
            .execute()
        
        if not result.data:
            return {"average": 0, "trend": "neutral", "count": 0}
        
        scores = [log["score"] for log in result.data]
        avg = sum(scores) / len(scores)
        
        return {
            "average": round(avg, 2),
            "trend": "improving" if avg > 6 else "declining" if avg < 4 else "stable",
            "count": len(scores)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
