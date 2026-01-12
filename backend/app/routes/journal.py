from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import JournalCreate, Journal
from app.database import get_db, supabase_admin
from app.auth import get_current_user
from app.services.ai_service import analyze_journal_entry, log_emotion
from typing import List

router = APIRouter(prefix="/journal", tags=["journal"])

@router.post("/", response_model=dict)
async def create_journal_entry(
    journal: JournalCreate, 
    user_id: str = Depends(get_current_user), 
    db=Depends(get_db)
):
    """Create a journal entry with comprehensive AI analysis"""
    try:
        print(f"[Journal] Creating entry for user: {user_id}")
        
        # Analyze journal content with AI
        analysis = await analyze_journal_entry(journal.content, journal.prompt_type)
        ai_feedback = analysis.get("ai_feedback")
        print(f"[Journal] AI analysis result: {ai_feedback[:100] if ai_feedback else 'No feedback'}...")
        
        # Use provided mood score or analyzed one
        mood_score = journal.mood_score or analysis.get("mood_score", 5)
        
        # Save journal - try with ai_feedback first, fall back to without if column doesn't exist
        insert_data = {
            "user_id": user_id,
            "content": journal.content,
        }
        
        # Add optional fields if provided
        if journal.prompt:
            insert_data["prompt"] = journal.prompt
        
        # Try to insert with ai_feedback column
        result = None
        if ai_feedback:
            try:
                insert_with_feedback = {**insert_data, "ai_feedback": ai_feedback}
                print(f"[Journal] Trying insert with ai_feedback column...")
                result = supabase_admin.table("journals").insert(insert_with_feedback).execute()
            except Exception as col_err:
                if "ai_feedback" in str(col_err):
                    print(f"[Journal] ai_feedback column doesn't exist, inserting without it")
                    result = None
                else:
                    raise col_err
        
        # Fallback: insert without ai_feedback if needed
        if result is None:
            print(f"[Journal] Inserting with data: {list(insert_data.keys())}")
            result = supabase_admin.table("journals").insert(insert_data).execute()
        
        print(f"[Journal] Insert result: {result.data}")
        
        journal_id = result.data[0]["id"] if result.data else None
        
        # Try to log emotion, but don't fail if it doesn't work
        try:
            await log_emotion(
                user_id=user_id,
                source="journal",
                source_id=journal_id,
                emotion_data={
                    "primary_emotion": analysis.get("primary_emotion", "neutral"),
                    "mood_score": mood_score,
                    "sentiment": analysis.get("sentiment", "neutral"),
                }
            )
        except Exception as emotion_err:
            print(f"[Journal] Emotion logging failed (non-critical): {emotion_err}")
        
        # Return data in format expected by frontend
        entry_data = result.data[0] if result.data else {}
        response = {
            "id": str(entry_data.get("id", "")),
            "prompt": journal.prompt or "",
            "content": journal.content,
            "prompt_type": journal.prompt_type,
            "mood_score": mood_score,
            "detected_emotions": [analysis.get("primary_emotion")] + analysis.get("secondary_emotions", []),
            "ai_analysis": analysis.get("ai_feedback"),
            "sentiment": analysis.get("sentiment"),
            "created_at": entry_data.get("created_at", "")
        }
        print(f"[Journal] Returning response with ai_analysis: {bool(response['ai_analysis'])}")
        return response
        
    except Exception as e:
        print(f"[Journal] ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[dict])
async def get_journal_entries(
    limit: int = 20, 
    user_id: str = Depends(get_current_user)
):
    """Get user's journal entries"""
    try:
        # Use service role client here because the anon client does not carry
        # the user's JWT, so RLS would return empty results.
        result = supabase_admin.table("journals")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        # Transform to frontend format
        entries = []
        for entry in (result.data if result.data else []):
            entries.append({
                "id": str(entry.get("id", "")),
                "prompt": entry.get("prompt", ""),
                "content": entry.get("content", ""),
                "prompt_type": entry.get("prompt_type"),
                "mood_score": entry.get("mood_score"),
                "detected_emotions": entry.get("detected_emotions", []),
                "ai_analysis": entry.get("ai_feedback") or entry.get("ai_analysis"),
                "sentiment": entry.get("sentiment"),
                "created_at": entry.get("created_at", "")
            })
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{journal_id}", response_model=dict)
async def get_journal_entry(
    journal_id: int, 
    user_id: str = Depends(get_current_user)
):
    """Get a specific journal entry"""
    try:
        # Use service role client for the same RLS/JWT reason as above.
        result = supabase_admin.table("journals")\
            .select("*")\
            .eq("id", journal_id)\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prompts/suggestions")
async def get_journal_prompts(
    mood: str = None,
    user_id: str = Depends(get_current_user)
):
    """Get personalized journal prompt suggestions based on current mood"""
    try:
        prompts = {
            "gratitude": {
                "title": "Gratitude",
                "icon": "🙏",
                "question": "What are 3 small things that made you smile today?",
                "description": "Shift focus to positive moments."
            },
            "stress": {
                "title": "Stress Relief",
                "icon": "🧩",
                "question": "What is weighing heaviest on your mind right now?",
                "description": "Deconstruct overwhelming feelings."
            },
            "reflection": {
                "title": "Reflection",
                "icon": "🌙",
                "question": "What is a feeling you've been avoiding lately?",
                "description": "Look inward and process."
            },
            "future": {
                "title": "Future Self",
                "icon": "🚀",
                "question": "Imagine yourself 6 months from now. What looks different?",
                "description": "Visualize your path forward."
            }
        }
        
        # If mood is provided, prioritize relevant prompts
        if mood and mood.lower() in ["anxious", "stressed", "overwhelmed"]:
            order = ["stress", "gratitude", "reflection", "future"]
        elif mood and mood.lower() in ["sad", "lonely", "down"]:
            order = ["gratitude", "reflection", "future", "stress"]
        else:
            order = ["gratitude", "stress", "reflection", "future"]
        
        return {
            "prompts": [prompts[key] for key in order],
            "suggested": order[0]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
