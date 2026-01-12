from pydantic import BaseModel
from typing import Optional, Literal, List, Dict
from datetime import datetime

# ============================================================
# USER MODELS
# ============================================================

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    timezone: Optional[str] = "UTC"
    created_at: datetime

# ============================================================
# CHAT SESSION MODELS
# ============================================================

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatSession(BaseModel):
    id: int
    user_id: str
    title: str
    summary: Optional[str] = None
    primary_emotion: Optional[str] = None
    avg_mood_score: Optional[int] = None
    topics: Optional[List[str]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

class ChatSessionSummary(BaseModel):
    id: int
    title: str
    primary_emotion: Optional[str] = None
    topics: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

# ============================================================
# CONVERSATION MODELS
# ============================================================

class ConversationCreate(BaseModel):
    message: str
    model_used: Literal["gemini", "groq"] = "gemini"
    session_id: Optional[int] = None

class Conversation(BaseModel):
    id: int
    user_id: str
    session_id: Optional[int] = None
    message: str
    response: str
    model_used: str
    emotional_tone: Optional[str] = None
    mood_score: Optional[int] = None
    sentiment: Optional[str] = None
    detected_topics: Optional[List[str]] = None
    summary: Optional[str] = None
    created_at: datetime

class ConversationResponse(BaseModel):
    success: bool
    response: str
    session_id: int
    emotional_tone: Optional[str] = None
    emotion_scores: Optional[Dict[str, int]] = None  # Multi-emotion confidence scores
    valence: Optional[float] = None  # -1.0 to +1.0 (unpleasant to pleasant)
    arousal: Optional[float] = None  # -1.0 to +1.0 (calm to activated)
    mood_score: Optional[int] = None
    sentiment: Optional[str] = None
    detected_topics: Optional[List[str]] = None
    needs_support: Optional[bool] = False
    crisis_level: Optional[str] = None
    crisis_keywords: Optional[List[str]] = None
    model_used: str
    suggested_goal: Optional[Dict] = None  # AI-detected goal suggestion for frontend

# ============================================================
# EMOTION MODELS
# ============================================================

class EmotionData(BaseModel):
    primary_emotion: str
    secondary_emotions: Optional[List[str]] = []
    mood_score: int
    sentiment: Literal["positive", "negative", "neutral", "mixed"]
    intensity: int
    topics: Optional[List[str]] = []
    triggers: Optional[List[str]] = []
    needs_support: bool = False

class EmotionLog(BaseModel):
    id: int
    user_id: str
    source: Literal["chat", "check-in", "journal", "mood-log"]
    source_id: Optional[int] = None
    primary_emotion: str
    secondary_emotions: Optional[List[str]] = []
    mood_score: Optional[int] = None
    sentiment: Optional[str] = None
    intensity: Optional[int] = None
    triggers: Optional[List[str]] = []
    topics: Optional[List[str]] = []
    timestamp: datetime

# ============================================================
# MOOD MODELS
# ============================================================

class MoodLogCreate(BaseModel):
    score: int  # 1-10
    energy: Optional[int] = None  # 1-10
    stress: Optional[Literal["Low", "Medium", "High"]] = None
    triggers: Optional[str] = None
    notes: Optional[str] = None

class MoodLog(MoodLogCreate):
    id: int
    user_id: str
    timestamp: datetime

class MoodTrend(BaseModel):
    date: str
    day: str
    mood: int
    stress: str
    sentiment: str
    emotion: Optional[str] = None

# ============================================================
# TASK MODELS
# ============================================================

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    task_type: Optional[str] = "general"
    due_date: Optional[datetime] = None
    priority: Optional[Literal["low", "medium", "high"]] = "medium"

class Task(TaskCreate):
    id: int
    user_id: str
    created_by: Literal["gemini", "groq", "user", "system"]
    emotion_context: Optional[str] = None
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime

class TaskGenerate(BaseModel):
    goal: str
    emotion_context: Optional[str] = None

# ============================================================
# JOURNAL MODELS
# ============================================================

class JournalCreate(BaseModel):
    prompt: Optional[str] = None  # The question/prompt that was shown
    content: str
    prompt_type: Optional[str] = None
    mood_score: Optional[int] = None

class Journal(BaseModel):
    id: int
    user_id: str
    prompt: Optional[str] = None
    content: str
    prompt_type: Optional[str] = None
    mood_score: Optional[int] = None
    detected_emotions: Optional[List[str]] = None
    detected_topics: Optional[List[str]] = None
    ai_feedback: Optional[str] = None
    ai_analysis: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime

# ============================================================
# GROWTH PLAN MODELS
# ============================================================

class PlanContext(BaseModel):
    """Rich context for personalized plan generation"""
    average_mood: Optional[float] = None
    mood_trend: Optional[str] = None
    top_emotions: Optional[List[str]] = None
    top_topics: Optional[List[str]] = None
    top_triggers: Optional[List[str]] = None
    total_sessions: Optional[int] = None
    patterns: Optional[List[str]] = None  # Human-readable pattern insights

class GrowthPlanCreate(BaseModel):
    focus_area: str  # 'anxiety', 'depression', 'stress', 'sleep', 'confidence', etc.
    duration_days: Optional[int] = 7  # Default 7 days, but user can choose 3, 5, 7, or 14
    user_state: Optional[Literal["struggling", "neutral", "thriving"]] = "neutral"
    context: Optional[PlanContext] = None  # Rich context for personalization

class GrowthPlan(BaseModel):
    id: int
    user_id: str
    title: str
    goal: Optional[str] = None
    focus_area: str
    week_number: int
    progress: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

class PlanTask(BaseModel):
    id: int
    plan_id: int
    day_number: int
    title: str
    description: Optional[str] = None
    task_type: str
    status: Literal["completed", "current", "locked"]
    completed_at: Optional[datetime] = None

class GrowthPlanWithTasks(GrowthPlan):
    tasks: List[PlanTask] = []

# ============================================================
# INSIGHTS MODELS
# ============================================================

class TriggerStat(BaseModel):
    label: str
    count: int

class TopicStat(BaseModel):
    topic: str
    count: int

class EmotionStat(BaseModel):
    emotion: str
    emoji: str = "😐"
    count: int

class MoodTrendItem(BaseModel):
    date: str
    day: str
    mood: int
    stress: str
    sentiment: str
    emotion: Optional[str] = None

class InsightsResponse(BaseModel):
    period_days: int
    average_mood: Optional[float] = None
    average_stress: Optional[str] = None
    average_energy: Optional[str] = None
    total_sessions: int
    total_sessions_all_time: Optional[int] = None
    total_messages: int
    tasks_completed: int
    top_emotions: List[EmotionStat]
    top_triggers: List[TriggerStat]
    top_topics: List[TopicStat]
    mood_trend: Optional[str] = None  # 'improving', 'stable', 'declining', or None if not enough data
    daily_insight: Optional[str] = None
    is_new_user: Optional[bool] = None
    account_age_days: Optional[int] = None
    has_data: Optional[bool] = None

# ============================================================
# CONTEXT CACHE
# ============================================================

class ContextCache(BaseModel):
    user_id: str
    last_emotional_state: Optional[str] = None
    stress_score: Optional[int] = None
    recent_summary: Optional[str] = None
    top_emotions: Optional[List[str]] = None
    top_triggers: Optional[List[str]] = None
    weekly_mood_avg: Optional[float] = None
    total_sessions: Optional[int] = 0
    current_focus_area: Optional[str] = None
    updated_at: datetime
