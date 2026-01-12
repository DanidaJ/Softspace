from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime
from app.models.schemas import ConversationCreate, ConversationResponse, ChatSessionSummary
from app.database import get_db, supabase_admin
from app.auth import get_current_user
from app.services.ai_service import (
    chat_with_gemini, 
    generate_tasks_with_groq,
    create_chat_session,
    get_or_create_active_session,
    update_session_title,
    update_session_analytics,
    log_emotion
)
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["chat"])

# Helper to check if sessions table exists
def sessions_enabled():
    try:
        result = supabase_admin.table("chat_sessions").select("id").limit(1).execute()
        return True
    except:
        return False

# ============================================================
# CHAT SESSIONS
# ============================================================

@router.get("/sessions", response_model=List[dict])
async def get_chat_sessions(
    limit: int = Query(default=50, le=100),
    user_id: str = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all chat sessions for the user (admin fetch to avoid RLS edge-cases)."""
    try:
        if not sessions_enabled():
            return []

        # Use admin client but STRICTLY filter by user_id to avoid leakage
        result = supabase_admin.table("chat_sessions")\
            .select("id, title, primary_emotion, topics, created_at, updated_at, is_active")\
            .eq("user_id", user_id)\
            .order("updated_at", desc=True)\
            .limit(limit)\
            .execute()

        sessions = result.data if result.data else []
        print(f"get_chat_sessions: returning {len(sessions)} sessions for user {user_id}")

        # Message counts
        for s in sessions:
            try:
                cnt = supabase_admin.table("conversations")\
                    .select("id", count="exact")\
                    .eq("session_id", s["id"])\
                    .execute()
                s["message_count"] = cnt.count or 0
            except Exception as _:
                s["message_count"] = 0

        return sessions
    except Exception as e:
        print(f"Sessions error: {e}")
        return []

@router.post("/sessions", response_model=dict)
async def create_new_session(
    user_id: str = Depends(get_current_user)
):
    """Create a new chat session"""
    try:
        if not sessions_enabled():
            return {"success": True, "session_id": None, "message": "Sessions not enabled"}
            
        session_id = await create_chat_session(user_id)
        return {
            "success": True,
            "session_id": session_id,
            "message": "New session created"
        }
    except Exception as e:
        return {"success": False, "session_id": None, "message": str(e)}

@router.get("/sessions/{session_id}/messages", response_model=List[dict])
async def get_session_messages(
    session_id: int,
    limit: int = Query(default=50, le=100),
    user_id: str = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all messages in a specific session"""
    try:
        # Verify session belongs to user - use admin client to avoid RLS issues
        session = supabase_admin.table("chat_sessions")\
            .select("id, created_at")\
            .eq("id", session_id)\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get messages that have this session_id - use admin client
        result = supabase_admin.table("conversations")\
            .select("*")\
            .eq("session_id", session_id)\
            .eq("user_id", user_id)\
            .order("created_at", desc=False)\
            .limit(limit)\
            .execute()
        
        print(f"get_session_messages: Found {len(result.data) if result.data else 0} messages for session {session_id}")
        
        # If no messages found with session_id, check if there are ANY orphaned conversations
        # and link them to this session (this handles old data before sessions existed)
        if not result.data or len(result.data) == 0:
            # Get ALL conversations without a session_id for this user
            unlinked = supabase_admin.table("conversations")\
                .select("*")\
                .eq("user_id", user_id)\
                .is_("session_id", "null")\
                .order("created_at", desc=False)\
                .limit(limit)\
                .execute()
            
            # Link ALL orphaned conversations to this session
            if unlinked.data and len(unlinked.data) > 0:
                print(f"Found {len(unlinked.data)} orphaned conversations, linking to session {session_id}")
                for conv in unlinked.data:
                    try:
                        supabase_admin.table("conversations")\
                            .update({"session_id": session_id})\
                            .eq("id", conv["id"])\
                            .execute()
                    except Exception as e:
                        print(f"Failed to link conversation {conv['id']}: {e}")
                
                return unlinked.data
        
        return result.data if result.data else []
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_session_messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    user_id: str = Depends(get_current_user)
):
    """Delete a chat session and all its messages"""
    try:
        if not sessions_enabled():
            return {"success": True, "message": "Sessions not enabled"}
            
        # Delete session (cascade will delete messages)
        supabase_admin.table("chat_sessions")\
            .delete()\
            .eq("id", session_id)\
            .eq("user_id", user_id)\
            .execute()
        
        return {"success": True, "message": "Session deleted"}
    except Exception as e:
        return {"success": False, "message": str(e)}


@router.get("/sessions/{session_id}/reflection")
async def get_session_reflection(
    session_id: int,
    user_id: str = Depends(get_current_user)
):
    """Generate a reflection/summary for a chat session to save to journal"""
    from app.services.ai_service import generate_session_reflection
    
    try:
        if not sessions_enabled():
            return {"error": "Sessions not enabled"}
        
        # Verify session belongs to user
        session = supabase_admin.table("chat_sessions")\
            .select("id")\
            .eq("id", session_id)\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Generate reflection
        reflection = await generate_session_reflection(session_id)
        
        return {
            "success": True,
            "session_id": session_id,
            **reflection
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating session reflection: {e}")
        return {
            "success": False,
            "error": str(e),
            "summary": "",
            "reflection": "",
            "emotions": [],
            "themes": []
        }

# ============================================================
# MAIN CHAT ENDPOINT
# ============================================================

@router.post("/", response_model=ConversationResponse)
async def chat(
    conversation: ConversationCreate, 
    user_id: str = Depends(get_current_user), 
    db=Depends(get_db)
):
    """
    Main chat endpoint - uses Gemini for empathetic conversations.
    Works with or without session management.
    """
    try:
        # Check if sessions are enabled
        use_sessions = sessions_enabled()
        
        # Use Gemini for therapeutic chat
        ai_response = await chat_with_gemini(
            conversation.message, 
            user_id,
            conversation.session_id if use_sessions else None
        )
        
        session_id = ai_response.get("session_id") if use_sessions else None
        
        # Build conversation data - only include columns that exist in YOUR schema
        # Your conversations table has: id, user_id, message, response, model_used, 
        # emotional_tone, summary, created_at, session_id
        # It does NOT have: detected_topics, sentiment, mood_score
        conv_data = {
            "user_id": user_id,
            "message": conversation.message,
            "response": ai_response["response"],
            "model_used": ai_response["model_used"],
            "emotional_tone": ai_response.get("emotional_tone", "neutral"),
            "summary": conversation.message[:200] if len(conversation.message) > 50 else None
        }
        
        # Add session_id if sessions are enabled
        if use_sessions and session_id:
            conv_data["session_id"] = session_id
        
        # Detect if this is the first message in this session (for title generation)
        is_first_message = False
        if session_id:
            try:
                msg_count = supabase_admin.table("conversations").select("id", count="exact").eq("session_id", session_id).execute()
                is_first_message = (msg_count.count or 0) == 0
            except Exception:
                is_first_message = False
        
        # Save conversation to database
        result = supabase_admin.table("conversations").insert(conv_data).execute()
        
        conversation_id = result.data[0]["id"] if result.data else None
        
        # Touch the session's updated_at and maybe primary_emotion
        if session_id:
            try:
                supabase_admin.table("chat_sessions")\
                    .update({
                        "updated_at": datetime.utcnow().isoformat(),
                        **({"primary_emotion": ai_response.get("emotional_tone")} if ai_response.get("emotional_tone") else {})
                    })\
                    .eq("id", session_id)\
                    .execute()
            except Exception as _:
                pass

        # Log emotion for analytics (graceful failure)
        try:
            await log_emotion(
                user_id=user_id,
                source="chat",
                source_id=conversation_id,
                emotion_data={
                    "primary_emotion": ai_response.get("emotional_tone", "neutral"),
                    "mood_score": ai_response.get("mood_score", 5),
                    "sentiment": ai_response.get("sentiment", "neutral"),
                    "topics": ai_response.get("detected_topics", [])
                }
            )
        except Exception as e:
            print(f"Emotion log failed (non-critical): {e}")
        
        # Update session title if first message
        if is_first_message and session_id:
            try:
                await update_session_title(session_id, conversation.message)
            except:
                pass
        
        # Update session analytics
        await update_session_analytics(session_id, {
            "primary_emotion": ai_response.get("emotional_tone"),
            "topics": ai_response.get("detected_topics", [])
        })
        
        # Build response
        response_obj = ConversationResponse(
            success=True,
            response=ai_response["response"],
            session_id=session_id,
            emotional_tone=ai_response.get("emotional_tone"),
            emotion_scores=ai_response.get("emotion_scores"),
            valence=ai_response.get("valence"),
            arousal=ai_response.get("arousal"),
            mood_score=ai_response.get("mood_score"),
            sentiment=ai_response.get("sentiment"),
            detected_topics=ai_response.get("detected_topics"),
            needs_support=ai_response.get("needs_support", False),
            crisis_level=ai_response.get("crisis_level"),
            crisis_keywords=ai_response.get("crisis_keywords"),
            model_used=ai_response["model_used"],
            suggested_goal=ai_response.get("suggested_goal")
        )
        
        # Log what we're sending back
        if ai_response.get("crisis_level") in ["moderate", "high", "immediate"]:
            print(f"📤 SENDING CRISIS RESPONSE TO FRONTEND:")
            print(f"   - crisis_level: {ai_response.get('crisis_level')}")
            print(f"   - crisis_keywords: {ai_response.get('crisis_keywords')}")
        
        return response_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# TASK GENERATION
# ============================================================

@router.post("/generate-tasks", response_model=dict)
async def generate_tasks(
    goal: str,
    emotion_context: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """
    Use Groq to generate task breakdown from a goal.
    Considers user's emotional state.
    """
    try:
        tasks = await generate_tasks_with_groq(goal, user_id, emotion_context)
        return {
            "success": True,
            "tasks": tasks,
            "message": f"Created {len(tasks)} tasks for your goal"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# CHAT HISTORY
# ============================================================

@router.get("/history", response_model=list)
async def get_chat_history(
    limit: int = 50, 
    session_id: Optional[int] = None,
    user_id: str = Depends(get_current_user), 
    db=Depends(get_db)
):
    """Get conversation history, optionally filtered by session"""
    try:
        query = db.table("conversations")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)
        
        if session_id:
            query = query.eq("session_id", session_id)
        
        result = query.execute()
        return result.data if result.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/context", response_model=dict)
async def get_user_context_route(
    user_id: str = Depends(get_current_user), 
    db=Depends(get_db)
):
    """Get shared context for AI models"""
    try:
        result = db.table("context_cache")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        return result.data if result.data else {}
    except Exception as e:
        return {}
