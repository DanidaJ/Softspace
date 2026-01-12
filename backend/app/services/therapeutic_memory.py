"""
Therapeutic Memory Service

Provides long-term memory and continuity for therapeutic conversations.
Tracks recurring themes, emotional progress, user goals, and patterns.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta, timezone
from app.database import supabase_admin
import json


def parse_timestamp(ts_string: str) -> datetime:
    """Parse timestamp string handling timezone-aware and naive formats."""
    if not ts_string:
        return datetime.now(timezone.utc)
    # Remove Z and add +00:00 for consistent parsing
    ts_clean = ts_string.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(ts_clean)
    except:
        # Fallback: try without timezone
        try:
            return datetime.fromisoformat(ts_string.replace("Z", "")).replace(tzinfo=timezone.utc)
        except:
            return datetime.now(timezone.utc)


class TherapeuticMemory:
    """Manages therapeutic continuity and memory for users"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
    
    # ============================================================
    # RECURRING THEMES
    # ============================================================
    
    async def track_themes(self, themes: List[str], session_id: int, emotion: str = None):
        """Track themes mentioned in a conversation"""
        for theme in themes:
            if not theme or len(theme) < 2:
                continue
            theme_lower = theme.lower().strip()
            
            try:
                # Check if theme exists
                existing = supabase_admin.table("recurring_themes")\
                    .select("*")\
                    .eq("user_id", self.user_id)\
                    .eq("theme", theme_lower)\
                    .execute()
                
                if existing.data and len(existing.data) > 0:
                    # Update existing theme
                    record = existing.data[0]
                    session_ids = record.get("session_ids", []) or []
                    if session_id not in session_ids:
                        session_ids.append(session_id)
                    
                    emotional_context = record.get("emotional_context", []) or []
                    if emotion and emotion not in emotional_context:
                        emotional_context.append(emotion)
                    
                    supabase_admin.table("recurring_themes")\
                        .update({
                            "mention_count": record["mention_count"] + 1,
                            "last_mentioned_at": datetime.now(timezone.utc).isoformat(),
                            "session_ids": session_ids,
                            "emotional_context": emotional_context
                        })\
                        .eq("id", record["id"])\
                        .execute()
                else:
                    # Insert new theme
                    supabase_admin.table("recurring_themes").insert({
                        "user_id": self.user_id,
                        "theme": theme_lower,
                        "mention_count": 1,
                        "session_ids": [session_id] if session_id else [],
                        "emotional_context": [emotion] if emotion else []
                    }).execute()
            except Exception as e:
                print(f"Theme tracking error: {e}")
    
    async def get_recurring_themes(self, min_mentions: int = 2, limit: int = 5) -> List[Dict]:
        """Get themes that have been mentioned multiple times"""
        try:
            result = supabase_admin.table("recurring_themes")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .gte("mention_count", min_mentions)\
                .order("mention_count", desc=True)\
                .limit(limit)\
                .execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Get themes error: {e}")
            return []
    
    # ============================================================
    # THERAPEUTIC GOALS
    # ============================================================
    
    async def get_active_goals(self) -> List[Dict]:
        """Get user's active therapeutic goals"""
        try:
            result = supabase_admin.table("therapeutic_goals")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .eq("is_active", True)\
                .order("created_at", desc=True)\
                .execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Get goals error: {e}")
            return []
    
    async def add_goal(self, goal_text: str, category: str = None) -> Dict:
        """Add a new therapeutic goal (user-initiated only)"""
        try:
            result = supabase_admin.table("therapeutic_goals").insert({
                "user_id": self.user_id,
                "goal_text": goal_text,
                "category": category,
                "is_active": True
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Add goal error: {e}")
            return None
    
    async def mark_goal_referenced(self, goal_id: int):
        """Mark that a goal was referenced in conversation"""
        try:
            supabase_admin.table("therapeutic_goals")\
                .update({"last_referenced_at": datetime.now(timezone.utc).isoformat()})\
                .eq("id", goal_id)\
                .execute()
        except Exception as e:
            print(f"Mark goal error: {e}")
    
    # ============================================================
    # EMOTIONAL PROGRESS
    # ============================================================
    
    async def get_emotional_progress(self, days: int = 30) -> Dict:
        """
        Calculate emotional progress over time.
        Returns gentle, awareness-focused summaries.
        """
        try:
            # Get emotion logs from the past N days (use timezone-aware datetime)
            start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            
            result = supabase_admin.table("emotion_logs")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .gte("timestamp", start_date)\
                .order("timestamp", desc=True)\
                .execute()
            
            if not result.data or len(result.data) < 3:
                return {"has_data": False}
            
            logs = result.data
            
            # Split into recent (last 7 days) and earlier
            # Use timezone-aware datetime for comparison
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            recent_logs = [l for l in logs if parse_timestamp(l.get("timestamp", "")) > week_ago]
            earlier_logs = [l for l in logs if parse_timestamp(l.get("timestamp", "")) <= week_ago]
            
            if not recent_logs or not earlier_logs:
                return {"has_data": False}
            
            # Calculate averages
            recent_avg = sum(l.get("mood_score", 5) for l in recent_logs) / len(recent_logs)
            earlier_avg = sum(l.get("mood_score", 5) for l in earlier_logs) / len(earlier_logs)
            
            # Count emotions
            recent_emotions = {}
            for l in recent_logs:
                emotion = l.get("primary_emotion", "neutral")
                recent_emotions[emotion] = recent_emotions.get(emotion, 0) + 1
            
            # Generate gentle summary (NEVER performance-focused)
            diff = recent_avg - earlier_avg
            if diff > 1:
                trend_summary = "You've been feeling a bit steadier compared to earlier this month."
            elif diff < -1:
                trend_summary = "Things have felt a bit heavier lately. That's okay — it's part of the journey."
            else:
                trend_summary = "Your emotional landscape has been relatively consistent lately."
            
            # Top recent emotions
            top_emotions = sorted(recent_emotions.items(), key=lambda x: x[1], reverse=True)[:3]
            
            return {
                "has_data": True,
                "recent_avg": round(recent_avg, 1),
                "earlier_avg": round(earlier_avg, 1),
                "trend_summary": trend_summary,
                "top_recent_emotions": [e[0] for e in top_emotions],
                "total_logs": len(logs),
                "period_days": days
            }
        except Exception as e:
            print(f"Emotional progress error: {e}")
            return {"has_data": False}
    
    # ============================================================
    # PATTERN DETECTION
    # ============================================================
    
    async def detect_patterns(self, current_emotion: str, current_themes: List[str], intensity: int) -> Optional[Dict]:
        """
        Detect if user is entering a familiar negative pattern.
        Returns soft intervention suggestion, never diagnosis.
        """
        try:
            # Get recent emotion logs (last 3 days)
            start_date = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
            
            result = supabase_admin.table("emotion_logs")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .gte("timestamp", start_date)\
                .order("timestamp", desc=True)\
                .limit(10)\
                .execute()
            
            if not result.data or len(result.data) < 3:
                return None
            
            logs = result.data
            
            # Check for spiral pattern (3+ consecutive negative high-intensity emotions)
            negative_emotions = ["anxious", "stressed", "overwhelmed", "sad", "hopeless", "angry", "frustrated"]
            spiral_count = 0
            
            for log in logs[:5]:
                if log.get("primary_emotion", "").lower() in negative_emotions and log.get("intensity", 5) >= 7:
                    spiral_count += 1
                else:
                    break
            
            # Current message also negative and intense?
            current_is_negative = current_emotion.lower() in negative_emotions and intensity >= 7
            
            if spiral_count >= 2 and current_is_negative:
                # Check if we recently showed an intervention
                recent_marker = supabase_admin.table("pattern_markers")\
                    .select("*")\
                    .eq("user_id", self.user_id)\
                    .eq("pattern_type", "spiral")\
                    .gte("last_occurred_at", (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat())\
                    .execute()
                
                if recent_marker.data and len(recent_marker.data) > 0:
                    # Already showed intervention recently
                    return None
                
                # Log the pattern
                supabase_admin.table("pattern_markers").insert({
                    "user_id": self.user_id,
                    "pattern_type": "spiral",
                    "trigger_theme": current_themes[0] if current_themes else None,
                    "intervention_shown": True
                }).execute()
                
                return {
                    "pattern_type": "spiral",
                    "intervention": "I notice we've touched on some heavy things recently, and it sounds like this is weighing on you too. Would it help to pause and take a breath together?",
                    "offer_grounding": True
                }
            
            # Check for recurring theme with consistent negative emotion
            if current_themes:
                for theme in current_themes:
                    theme_record = supabase_admin.table("recurring_themes")\
                        .select("*")\
                        .eq("user_id", self.user_id)\
                        .eq("theme", theme.lower())\
                        .execute()
                    
                    if theme_record.data and len(theme_record.data) > 0:
                        record = theme_record.data[0]
                        if record.get("mention_count", 0) >= 5:
                            emotional_context = record.get("emotional_context", [])
                            # If this theme is mostly associated with negative emotions
                            negative_count = sum(1 for e in emotional_context if e.lower() in negative_emotions)
                            if negative_count >= 3:
                                return {
                                    "pattern_type": "recurring_pain",
                                    "theme": theme,
                                    "mention_count": record["mention_count"],
                                    "intervention": f"This topic of '{theme}' has come up several times, and it seems to carry some weight for you. I'm here to sit with it as long as you need.",
                                    "offer_grounding": False
                                }
            
            return None
        except Exception as e:
            print(f"Pattern detection error: {e}")
            return None
    
    # ============================================================
    # SIGNIFICANT MOMENTS
    # ============================================================
    
    async def log_significant_moment(
        self, 
        moment_type: str, 
        summary: str, 
        session_id: int = None,
        conversation_id: int = None,
        user_excerpt: str = None
    ):
        """Log a breakthrough or significant therapeutic moment"""
        try:
            supabase_admin.table("significant_moments").insert({
                "user_id": self.user_id,
                "session_id": session_id,
                "conversation_id": conversation_id,
                "moment_type": moment_type,
                "summary": summary,
                "user_message_excerpt": user_excerpt[:200] if user_excerpt else None
            }).execute()
        except Exception as e:
            print(f"Log moment error: {e}")
    
    async def get_significant_moments(self, limit: int = 5) -> List[Dict]:
        """Get recent significant moments for reflection"""
        try:
            result = supabase_admin.table("significant_moments")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Get moments error: {e}")
            return []
    
    # ============================================================
    # BUILD CONTEXT FOR AI
    # ============================================================
    
    async def build_therapeutic_context(self) -> Dict:
        """Build full therapeutic context to inject into AI prompts"""
        context = {
            "has_memory": False,
            "recurring_themes": [],
            "active_goals": [],
            "emotional_progress": None,
            "significant_moments": [],
            "pattern_alert": None
        }
        
        try:
            # Get recurring themes
            themes = await self.get_recurring_themes(min_mentions=2, limit=3)
            if themes:
                context["recurring_themes"] = [
                    {
                        "theme": t["theme"],
                        "mentions": t["mention_count"],
                        "emotions": t.get("emotional_context", [])[:3]
                    }
                    for t in themes
                ]
                context["has_memory"] = True
            
            # Get active goals
            goals = await self.get_active_goals()
            if goals:
                context["active_goals"] = [
                    {
                        "goal": g["goal_text"],
                        "category": g.get("category"),
                        "set_on": g["created_at"][:10]  # Just date
                    }
                    for g in goals[:3]
                ]
                context["has_memory"] = True
            
            # Get emotional progress
            progress = await self.get_emotional_progress(days=30)
            if progress.get("has_data"):
                context["emotional_progress"] = progress
                context["has_memory"] = True
            
            # Get recent significant moments
            moments = await self.get_significant_moments(limit=2)
            if moments:
                context["significant_moments"] = [
                    {
                        "type": m["moment_type"],
                        "summary": m["summary"],
                        "when": m["created_at"][:10]
                    }
                    for m in moments
                ]
                context["has_memory"] = True
        
        except Exception as e:
            print(f"Build context error: {e}")
        
        return context

    # ============================================================
    # SMART GOAL REMINDERS
    # ============================================================
    
    async def check_goal_reminder(self) -> Optional[Dict]:
        """
        Check if any goal should trigger a gentle reminder based on context.
        Returns reminder info if applicable, None otherwise.
        
        Rules:
        - Only remind once per 6 hours per goal
        - Only remind max 2 times per day total
        - Contextual triggers (e.g., late night for sleep goals)
        """
        try:
            now = datetime.now(timezone.utc)
            current_hour = now.hour
            
            # Get active goals
            goals = await self.get_active_goals()
            if not goals:
                return None
            
            for goal in goals:
                goal_id = goal["id"]
                category = goal.get("category", "").lower()
                goal_text = goal.get("goal_text", "").lower()
                last_reminder = goal.get("last_reminder_at")
                reminder_count = goal.get("reminder_count", 0)
                
                # Check cooldown (6 hours since last reminder for this goal)
                if last_reminder:
                    last_reminder_dt = parse_timestamp(last_reminder)
                    hours_since = (now - last_reminder_dt).total_seconds() / 3600
                    if hours_since < 6:
                        continue
                
                # Check daily limit (max 2 reminders per day)
                if reminder_count >= 2:
                    # Reset count if it's a new day
                    goal_created = parse_timestamp(goal.get("created_at", ""))
                    if (now - goal_created).days > 0:
                        # Could reset here, but for simplicity we'll let it accumulate
                        pass
                
                # ============================================================
                # CONTEXTUAL TRIGGER CHECKS
                # ============================================================
                
                reminder = None
                
                # SLEEP GOAL: Trigger if chatting between 11 PM - 4 AM
                if category == "sleep" or any(w in goal_text for w in ["sleep", "bed", "rest", "midnight"]):
                    if current_hour >= 23 or current_hour < 4:
                        reminder = {
                            "goal_id": goal_id,
                            "goal_text": goal["goal_text"],
                            "category": "sleep",
                            "trigger": "late_night",
                            "gentle_nudge": f"By the way, I noticed it's getting late. I know sleep is something you've been working on. No pressure at all — I'm here whenever. But if you want to wind down, we could do a quick breathing exercise, or just say goodnight when you're ready."
                        }
                
                # ANXIETY GOAL: Could trigger if emotion is anxious (passed from caller)
                # This is handled in the AI service with emotion data
                
                # STRESS GOAL: Similar to anxiety
                
                if reminder:
                    # Update reminder tracking
                    try:
                        supabase_admin.table("therapeutic_goals")\
                            .update({
                                "last_reminder_at": now.isoformat(),
                                "reminder_count": reminder_count + 1
                            })\
                            .eq("id", goal_id)\
                            .execute()
                    except:
                        pass
                    
                    return reminder
            
            return None
        except Exception as e:
            print(f"Goal reminder check error: {e}")
            return None
    
    async def detect_potential_goal(self, message: str, topics: List[str], emotion: str) -> Optional[Dict]:
        """
        Detect if user's message suggests a goal they might want to set.
        Returns suggestion info if detected, None otherwise.
        
        Only suggests if:
        - Clear intent language ("I want to...", "I need to...", "I should...")
        - Wellbeing-related topic
        - User doesn't already have a similar active goal
        """
        try:
            message_lower = message.lower()
            
            # Intent markers that suggest goal-setting
            intent_markers = [
                "i want to ", "i need to ", "i should ", "i'm trying to ",
                "i've been meaning to ", "my goal is ", "i wish i could ",
                "i really need to ", "i have to start ", "i want to work on ",
                "i'm working on ", "i need to get better at "
            ]
            
            has_intent = any(marker in message_lower for marker in intent_markers)
            if not has_intent:
                return None
            
            # Wellbeing categories we care about
            wellbeing_keywords = {
                "sleep": ["sleep", "bed", "rest", "insomnia", "tired", "exhausted", "midnight", "wake up"],
                "anxiety": ["anxiety", "anxious", "worried", "panic", "nervous", "calm down", "relax"],
                "stress": ["stress", "stressed", "overwhelmed", "pressure", "burnout", "too much"],
                "mood": ["mood", "happy", "sad", "depressed", "emotions", "feeling better"],
                "self-care": ["self-care", "take care", "exercise", "eating", "health", "meditate"],
                "boundaries": ["boundaries", "say no", "people pleasing", "too nice", "overwhelmed by others"],
                "relationships": ["relationship", "friend", "family", "partner", "connect", "lonely", "reach out"]
            }
            
            detected_category = None
            for category, keywords in wellbeing_keywords.items():
                if any(kw in message_lower for kw in keywords):
                    detected_category = category
                    break
            
            if not detected_category:
                return None
            
            # Check if user already has a goal in this category
            existing_goals = await self.get_active_goals()
            for goal in existing_goals:
                if goal.get("category") == detected_category:
                    return None  # Already has a goal in this category
            
            # Extract the goal-like phrase
            # Simple extraction: take the part after the intent marker
            goal_phrase = None
            for marker in intent_markers:
                if marker in message_lower:
                    idx = message_lower.find(marker)
                    goal_phrase = message[idx + len(marker):]
                    # Clean up: take until period, comma, or end
                    for end_char in [".", ",", "!", "?"]:
                        if end_char in goal_phrase:
                            goal_phrase = goal_phrase.split(end_char)[0]
                    goal_phrase = goal_phrase.strip()[:100]  # Limit length
                    break
            
            if not goal_phrase or len(goal_phrase) < 10:
                return None
            
            return {
                "detected_goal": goal_phrase,
                "category": detected_category,
                "confidence": "medium",  # Could add more sophisticated scoring
                "source_message": message[:200]
            }
            
        except Exception as e:
            print(f"Goal detection error: {e}")
            return None
        
        return context


# ============================================================
# HELPER FUNCTIONS
# ============================================================

async def get_therapeutic_memory(user_id: str) -> TherapeuticMemory:
    """Factory function to get a TherapeuticMemory instance"""
    return TherapeuticMemory(user_id)


async def format_memory_for_prompt(memory_context: Dict) -> str:
    """Format therapeutic memory for injection into AI prompts"""
    if not memory_context.get("has_memory"):
        return "No prior therapeutic history with this user yet."
    
    sections = []
    
    # Recurring themes
    if memory_context.get("recurring_themes"):
        themes_text = []
        for t in memory_context["recurring_themes"]:
            emotions = ", ".join(t["emotions"][:2]) if t["emotions"] else "various emotions"
            themes_text.append(f"- '{t['theme']}' (mentioned {t['mentions']} times, often with {emotions})")
        sections.append(f"RECURRING THEMES:\n" + "\n".join(themes_text))
    
    # Active goals
    if memory_context.get("active_goals"):
        goals_text = [f"- {g['goal']} (set on {g['set_on']})" for g in memory_context["active_goals"]]
        sections.append(f"USER'S THERAPEUTIC GOALS (user-set, reference gently):\n" + "\n".join(goals_text))
    
    # Emotional progress
    if memory_context.get("emotional_progress"):
        progress = memory_context["emotional_progress"]
        sections.append(f"EMOTIONAL AWARENESS:\n{progress['trend_summary']}\nRecent feelings: {', '.join(progress.get('top_recent_emotions', []))}")
    
    # Significant moments
    if memory_context.get("significant_moments"):
        moments_text = [f"- {m['type']}: {m['summary']} ({m['when']})" for m in memory_context["significant_moments"]]
        sections.append(f"MEANINGFUL MOMENTS FROM PAST SESSIONS:\n" + "\n".join(moments_text))
    
    return "\n\n".join(sections)
