from fastapi import APIRouter, HTTPException, Depends, Query, Request
from app.database import get_db, supabase_admin
from app.auth import get_current_user
from app.services.ai_service import (
    get_user_insights,
    generate_ai_insight,
    generate_growth_plan_with_groq
)
from app.models.schemas import InsightsResponse, GrowthPlanCreate, GrowthPlanWithTasks
from typing import List
from datetime import datetime, timedelta, timezone as tz

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("/", response_model=InsightsResponse)
async def get_insights(
    request: Request,
    days: int = Query(default=7, le=30),
    generate_ai: bool = Query(default=False, description="Generate AI insight (slower)"),
    user_id: str = Depends(get_current_user)
):
    """
    Get comprehensive insights based on real user data.
    Includes mood trends, emotion patterns, triggers.
    Set generate_ai=true to include AI-generated insight (adds 1-2s latency).
    """
    try:
        client_tz = request.headers.get("X-Timezone", "UTC")

        insights = await get_user_insights(user_id, days, client_tz)
        
        # Only generate AI insight if explicitly requested (to avoid slow dashboard loads)
        if generate_ai:
            ai_insight = await generate_ai_insight(user_id, client_tz)
            insights["daily_insight"] = ai_insight
        else:
            insights["daily_insight"] = "View your detailed insights to get AI-powered recommendations."
        
        return InsightsResponse(**insights)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/timeline")
async def get_mood_timeline(
    request: Request,
    days: int = Query(default=7, le=30),
    user_id: str = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get daily mood timeline for visualization with trends, energy levels, and real dates"""
    try:
        # Get client timezone from header (default to UTC)
        client_tz = request.headers.get("X-Timezone", "UTC")
        
        # Calculate date range based on client timezone
        try:
            import pytz
            tz_obj = pytz.timezone(client_tz)
            now_client = datetime.now(tz_obj)
            since_date_client = now_client - timedelta(days=days)
            # Convert to UTC for database query
            since_date = since_date_client.astimezone(pytz.UTC).isoformat()
        except:
            # Fallback to UTC if pytz not available or invalid timezone
            since_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        logs = []
        
        # Try emotion_logs table first
        try:
            result = supabase_admin.table("emotion_logs")\
                .select("timestamp, mood_score, primary_emotion, sentiment")\
                .eq("user_id", user_id)\
                .gte("timestamp", since_date)\
                .order("timestamp", desc=False)\
                .execute()
            logs = result.data if result.data else []
        except:
            # Fall back to mood_logs if emotion_logs doesn't exist
            try:
                result = supabase_admin.table("mood_logs")\
                    .select("timestamp, score")\
                    .eq("user_id", user_id)\
                    .gte("timestamp", since_date)\
                    .order("timestamp", desc=False)\
                    .execute()
                # Convert mood_logs format to emotion_logs format
                logs = [{"timestamp": l.get("timestamp"), "mood_score": l.get("score"), "primary_emotion": "neutral", "sentiment": "neutral"} for l in (result.data or [])]
            except:
                logs = []
        
        if not logs:
            return []
        
        # Helper to convert UTC timestamp to client timezone date
        def get_local_date(timestamp_str: str) -> str:
            try:
                import pytz
                # Parse the timestamp
                if timestamp_str.endswith('Z'):
                    timestamp_str = timestamp_str[:-1] + '+00:00'
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=pytz.UTC)
                # Convert to client timezone
                tz_obj = pytz.timezone(client_tz)
                local_dt = dt.astimezone(tz_obj)
                return local_dt.strftime('%Y-%m-%d')
            except:
                # Fallback: just extract date part
                return timestamp_str[:10] if timestamp_str else ""
        
        # Group by day (in client timezone)
        daily_data = {}
        for log in logs:
            date = get_local_date(log.get("timestamp", ""))
            if not date:
                continue
            if date not in daily_data:
                daily_data[date] = {"moods": [], "emotions": [], "sentiments": []}
            if log.get("mood_score"):
                daily_data[date]["moods"].append(log["mood_score"])
            if log.get("primary_emotion"):
                daily_data[date]["emotions"].append(log["primary_emotion"])
            if log.get("sentiment"):
                daily_data[date]["sentiments"].append(log["sentiment"])
        
        timeline = []
        prev_mood = None
        prev_stress = None
        prev_sentiment = None
        lowest_mood = {"date": None, "mood": 10}
        
        for date, data in sorted(daily_data.items()):
            avg_mood = sum(data["moods"]) / len(data["moods"]) if data["moods"] else 5
            dominant_emotion = max(set(data["emotions"]), key=data["emotions"].count) if data["emotions"] else "neutral"
            dominant_sentiment = max(set(data["sentiments"]), key=data["sentiments"].count) if data["sentiments"] else "neutral"
            
            # Calculate stress (inverse of mood for simplicity)
            stress_level = "High" if avg_mood < 4 else "Medium" if avg_mood < 7 else "Low"
            
            # Derive energy from mood variance and intensity (simplified arousal proxy)
            mood_variance = max(data["moods"]) - min(data["moods"]) if len(data["moods"]) > 1 else 0
            energy = "High" if mood_variance > 3 or avg_mood > 7 else "Low" if avg_mood < 4 else "Balanced"
            
            # Calculate trends (arrows)
            mood_trend = "→"  # stable
            if prev_mood is not None:
                if avg_mood > prev_mood + 0.5:
                    mood_trend = "↑"
                elif avg_mood < prev_mood - 0.5:
                    mood_trend = "↓"
            
            stress_trend = "→"
            stress_rank = {"Low": 1, "Medium": 2, "High": 3}
            if prev_stress is not None:
                if stress_rank.get(stress_level, 2) < stress_rank.get(prev_stress, 2):
                    stress_trend = "↓"  # stress decreasing is good
                elif stress_rank.get(stress_level, 2) > stress_rank.get(prev_stress, 2):
                    stress_trend = "↑"
            
            sentiment_trend = "→"
            sentiment_rank = {"negative": 1, "neutral": 2, "mixed": 2, "positive": 3}
            if prev_sentiment is not None:
                if sentiment_rank.get(dominant_sentiment.lower(), 2) > sentiment_rank.get(prev_sentiment.lower(), 2):
                    sentiment_trend = "↑"
                elif sentiment_rank.get(dominant_sentiment.lower(), 2) < sentiment_rank.get(prev_sentiment.lower(), 2):
                    sentiment_trend = "↓"
            
            # Track notable (lowest) day
            if avg_mood < lowest_mood["mood"]:
                lowest_mood = {"date": date, "mood": avg_mood}
            
            # Format date with day name and date number
            date_obj = datetime.fromisoformat(date)
            formatted_day = date_obj.strftime("%a %d")  # e.g., "Mon 23"
            
            timeline.append({
                "date": date,
                "day": formatted_day,
                "mood": round(avg_mood, 1),
                "mood_trend": mood_trend,
                "stress": stress_level,
                "stress_trend": stress_trend,
                "energy": energy,
                "sentiment": dominant_sentiment.capitalize(),
                "sentiment_trend": sentiment_trend,
                "emotion": dominant_emotion,
                "is_notable": False  # Will be set later
            })
            
            prev_mood = avg_mood
            prev_stress = stress_level
            prev_sentiment = dominant_sentiment
        
        # Mark notable day (lowest mood day)
        if lowest_mood["date"] and len(timeline) > 1:
            for item in timeline:
                if item["date"] == lowest_mood["date"]:
                    item["is_notable"] = True
                    break
        
        return timeline
    except Exception as e:
        print(f"Timeline error: {e}")
        return []  # Return empty instead of error

@router.get("/emotions/summary")
async def get_emotion_summary(
    days: int = Query(default=7, le=30),
    user_id: str = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get summary of emotions over time"""
    try:
        from datetime import datetime, timedelta
        since_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase_admin.table("emotion_logs")\
            .select("primary_emotion, mood_score, triggers, topics")\
            .eq("user_id", user_id)\
            .gte("timestamp", since_date)\
            .execute()
        
        logs = result.data if result.data else []
        
        # Count emotions
        emotion_counts = {}
        all_triggers = []
        all_topics = []
        mood_scores = []
        
        for log in logs:
            if log.get("primary_emotion"):
                emotion_counts[log["primary_emotion"]] = emotion_counts.get(log["primary_emotion"], 0) + 1
            if log.get("mood_score"):
                mood_scores.append(log["mood_score"])
            if log.get("triggers"):
                all_triggers.extend(log["triggers"])
            if log.get("topics"):
                all_topics.extend(log["topics"])
        
        # Sort by frequency
        sorted_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Count triggers and topics
        trigger_counts = {}
        for t in all_triggers:
            trigger_counts[t] = trigger_counts.get(t, 0) + 1
        
        topic_counts = {}
        for t in all_topics:
            topic_counts[t] = topic_counts.get(t, 0) + 1
        
        return {
            "total_entries": len(logs),
            "average_mood": round(sum(mood_scores) / len(mood_scores), 1) if mood_scores else 5,
            "top_emotions": [{"emotion": e[0], "count": e[1], "percentage": round(e[1]/len(logs)*100)} for e in sorted_emotions[:5]],
            "top_triggers": sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "top_topics": sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:6]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# GROWTH PLANS
# ============================================================

@router.post("/plans", response_model=dict)
async def create_growth_plan(
    plan: GrowthPlanCreate,
    user_id: str = Depends(get_current_user)
):
    """Create a personalized growth plan based on focus area and user context"""
    try:
        # Extract context dict if provided
        context_dict = None
        if plan.context:
            context_dict = {
                "average_mood": plan.context.average_mood,
                "mood_trend": plan.context.mood_trend,
                "top_emotions": plan.context.top_emotions,
                "top_topics": plan.context.top_topics,
                "top_triggers": plan.context.top_triggers,
                "total_sessions": plan.context.total_sessions,
                "patterns": plan.context.patterns
            }
        
        result = await generate_growth_plan_with_groq(
            user_id=user_id,
            focus_area=plan.focus_area,
            duration_days=plan.duration_days or 7,
            user_state=plan.user_state or "neutral",
            context=context_dict
        )
        
        # Format response for frontend
        plan_id = result.get("plan_id")
        
        if not plan_id:
            raise HTTPException(status_code=500, detail="Failed to create plan")
        
        # Get the created tasks
        tasks_result = supabase_admin.table("plan_tasks")\
            .select("*")\
            .eq("plan_id", plan_id)\
            .order("day_number", desc=False)\
            .execute()
        
        tasks = []
        for task in (tasks_result.data if tasks_result.data else []):
            tasks.append({
                "id": str(task.get("id")),
                "plan_id": str(plan_id),
                "day": task.get("day_number", 1),
                "title": task.get("title", ""),
                "description": task.get("description", ""),
                "type": task.get("task_type", "checkin"),
                "status": task.get("status", "locked")
            })
        
        return {
            "id": str(plan_id),
            "title": result.get("title", "Growth Plan"),
            "goal": result.get("goal", ""),
            "focus_area": plan.focus_area,
            "week_number": 1,
            "progress": 0,
            "is_active": True,
            "tasks": tasks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans", response_model=List[dict])
async def get_growth_plans(
    active_only: bool = True,
    user_id: str = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get user's growth plans with their tasks"""
    try:
        query = db.table("growth_plans")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)
        
        if active_only:
            query = query.eq("is_active", True)
        
        result = query.execute()
        plans = []
        
        for plan in (result.data if result.data else []):
            plan_id = plan.get("id")
            
            # Get tasks for this plan
            tasks_result = db.table("plan_tasks")\
                .select("*")\
                .eq("plan_id", plan_id)\
                .order("day_number", desc=False)\
                .execute()
            
            tasks = []
            completed_count = 0
            for task in (tasks_result.data if tasks_result.data else []):
                if task.get("status") == "completed":
                    completed_count += 1
                tasks.append({
                    "id": str(task.get("id")),
                    "plan_id": str(plan_id),
                    "day": task.get("day_number", 1),
                    "title": task.get("title", ""),
                    "description": task.get("description", ""),
                    "type": task.get("task_type", "checkin"),
                    "status": task.get("status", "locked")
                })
            
            progress = int((completed_count / len(tasks)) * 100) if tasks else 0
            
            plans.append({
                "id": str(plan_id),
                "title": plan.get("title", "Growth Plan"),
                "goal": plan.get("goal", ""),
                "focus_area": plan.get("focus_area", "general"),
                "week_number": plan.get("week_number", 1),
                "progress": progress,
                "is_active": plan.get("is_active", True),
                "tasks": tasks
            })
        
        return plans
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans/{plan_id}", response_model=dict)
async def get_growth_plan_details(
    plan_id: int,
    user_id: str = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get a specific growth plan with its tasks"""
    try:
        # Get plan
        plan_result = db.table("growth_plans")\
            .select("*")\
            .eq("id", plan_id)\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        
        if not plan_result.data:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        # Get tasks
        tasks_result = db.table("plan_tasks")\
            .select("*")\
            .eq("plan_id", plan_id)\
            .order("day_number", desc=False)\
            .execute()
        
        plan_data = plan_result.data
        plan_data["tasks"] = tasks_result.data if tasks_result.data else []
        
        return GrowthPlanWithTasks(**plan_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/plans/{plan_id}/tasks/{task_id}")
async def complete_plan_task(
    plan_id: int,
    task_id: int,
    user_id: str = Depends(get_current_user)
):
    """Mark a plan task as completed and unlock next"""
    try:
        from datetime import datetime
        
        # Mark task as completed
        supabase_admin.table("plan_tasks")\
            .update({"status": "completed", "completed_at": datetime.utcnow().isoformat()})\
            .eq("id", task_id)\
            .eq("user_id", user_id)\
            .execute()
        
        # Get completed task to find day number
        task_result = supabase_admin.table("plan_tasks")\
            .select("day_number")\
            .eq("id", task_id)\
            .single()\
            .execute()
        
        if task_result.data:
            next_day = task_result.data["day_number"] + 1
            
            # Unlock next task
            supabase_admin.table("plan_tasks")\
                .update({"status": "current"})\
                .eq("plan_id", plan_id)\
                .eq("day_number", next_day)\
                .execute()
            
            # Update plan progress
            completed_count = supabase_admin.table("plan_tasks")\
                .select("id", count="exact")\
                .eq("plan_id", plan_id)\
                .eq("status", "completed")\
                .execute()
            
            progress = int((completed_count.count or 0) / 7 * 100)
            supabase_admin.table("growth_plans")\
                .update({"progress": progress, "updated_at": datetime.utcnow().isoformat()})\
                .eq("id", plan_id)\
                .execute()
        
        return {"success": True, "message": "Task completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/plans/{plan_id}")
async def delete_growth_plan(
    plan_id: int,
    user_id: str = Depends(get_current_user)
):
    """Delete a growth plan and its tasks (soft delete - marks as inactive)"""
    try:
        from datetime import datetime
        
        # Verify plan belongs to user and set to inactive
        result = supabase_admin.table("growth_plans")\
            .update({"is_active": False, "updated_at": datetime.utcnow().isoformat()})\
            .eq("id", plan_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return {"success": True, "message": "Plan deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daily")
async def get_daily_insight(
    user_id: str = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get today's insight and recommendation"""
    try:
        from datetime import datetime, date
        
        today = date.today().isoformat()
        
        # Check if we have today's insight cached
        cached = db.table("daily_insights")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("date", today)\
            .single()\
            .execute()
        
        if cached.data:
            return cached.data
        
        # Generate new daily insight
        insights = await get_user_insights(user_id, 1)  # Just today
        ai_insight = await generate_ai_insight(user_id)
        
        # Cache it
        daily_data = {
            "user_id": user_id,
            "date": today,
            "avg_mood": int(insights.get("weekly_mood_average", 5)),
            "dominant_emotion": insights.get("top_emotions", [{}])[0].get("emotion") if insights.get("top_emotions") else None,
            "messages_sent": insights.get("total_messages", 0),
            "tasks_completed": insights.get("tasks_completed", 0),
            "ai_summary": ai_insight
        }
        
        supabase_admin.table("daily_insights").upsert(daily_data).execute()
        
        return daily_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
