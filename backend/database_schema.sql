-- Run this SQL in your Supabase SQL Editor
-- Cosmic Companion AI - Complete Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS & PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CHAT SESSIONS - Group conversations into sessions like GPT/Claude
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    summary TEXT,
    -- Aggregated emotional data for this session
    primary_emotion TEXT,
    avg_mood_score INTEGER CHECK (avg_mood_score >= 1 AND avg_mood_score <= 10),
    topics TEXT[], -- Array of detected topics
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS - Individual messages within sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used TEXT NOT NULL CHECK (model_used IN ('gemini', 'groq')),
    -- Emotion analysis per message
    emotional_tone TEXT,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    detected_topics TEXT[], -- Topics detected in this message
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- EMOTION LOGS - Track emotions over time (from chat + check-ins)
-- ============================================================
CREATE TABLE IF NOT EXISTS emotion_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('chat', 'check-in', 'journal', 'mood-log')),
    source_id INTEGER, -- Reference to the source (conversation_id, journal_id, etc.)
    -- Emotion data
    primary_emotion TEXT NOT NULL,
    secondary_emotions TEXT[],
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
    -- Context
    triggers TEXT[],
    topics TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- MOOD LOGS - Daily mood check-ins
-- ============================================================
CREATE TABLE IF NOT EXISTS mood_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    energy INTEGER CHECK (energy >= 1 AND energy <= 10),
    stress TEXT CHECK (stress IN ('Low', 'Medium', 'High')),
    triggers TEXT,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- JOURNALS - Journal entries with AI analysis
-- ============================================================
CREATE TABLE IF NOT EXISTS journals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT, -- The question/prompt that was shown to user
    content TEXT NOT NULL,
    prompt_type TEXT, -- 'gratitude', 'stress', 'reflection', 'future'
    -- AI Analysis
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    detected_emotions TEXT[],
    detected_topics TEXT[],
    ai_feedback TEXT,
    ai_analysis TEXT, -- Duplicate of ai_feedback for frontend compatibility
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TASKS - AI-generated and user tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT DEFAULT 'general', -- 'breathing', 'journal', 'exercise', 'education', 'checkin', 'general'
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_by TEXT NOT NULL CHECK (created_by IN ('gemini', 'groq', 'user', 'system')),
    -- Context for why this task was created
    emotion_context TEXT, -- The emotion that triggered this task
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- GROWTH PLANS - Weekly plans with progress
-- ============================================================
CREATE TABLE IF NOT EXISTS growth_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    goal TEXT,
    focus_area TEXT, -- 'anxiety', 'depression', 'stress', 'sleep', 'confidence', etc.
    week_number INTEGER DEFAULT 1,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PLAN TASKS - Tasks within growth plans
-- ============================================================
CREATE TABLE IF NOT EXISTS plan_tasks (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES growth_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL CHECK (task_type IN ('breathing', 'journal', 'exercise', 'education', 'checkin')),
    status TEXT DEFAULT 'locked' CHECK (status IN ('completed', 'current', 'locked')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CONTEXT CACHE - Shared AI state between models
-- ============================================================
CREATE TABLE IF NOT EXISTS context_cache (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_emotional_state TEXT,
    stress_score INTEGER CHECK (stress_score >= 1 AND stress_score <= 10),
    recent_summary TEXT,
    -- Aggregated insights
    top_emotions TEXT[],
    top_triggers TEXT[],
    weekly_mood_avg DECIMAL(3,1),
    total_sessions INTEGER DEFAULT 0,
    current_focus_area TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- DAILY INSIGHTS - Pre-computed daily analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_insights (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Mood data
    avg_mood INTEGER CHECK (avg_mood >= 1 AND avg_mood <= 10),
    high_mood INTEGER,
    low_mood INTEGER,
    -- Emotion data
    dominant_emotion TEXT,
    emotion_counts JSONB, -- {"happy": 5, "anxious": 3, ...}
    -- Activity data
    messages_sent INTEGER DEFAULT 0,
    journal_entries INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    exercises_done INTEGER DEFAULT 0,
    -- AI insights
    ai_summary TEXT,
    ai_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user_id ON emotion_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_timestamp ON emotion_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_timestamp ON mood_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_created_at ON journals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_growth_plans_user_id ON growth_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_tasks_plan_id ON plan_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_insights_user_date ON daily_insights(user_id, date DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Chat Sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Emotion Logs
CREATE POLICY "Users can view own emotion logs" ON emotion_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emotion logs" ON emotion_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mood Logs
CREATE POLICY "Users can view own mood logs" ON mood_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood logs" ON mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journals
CREATE POLICY "Users can view own journals" ON journals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journals" ON journals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journals" ON journals FOR UPDATE USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Growth Plans
CREATE POLICY "Users can view own growth plans" ON growth_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own growth plans" ON growth_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own growth plans" ON growth_plans FOR UPDATE USING (auth.uid() = user_id);

-- Plan Tasks
CREATE POLICY "Users can view own plan tasks" ON plan_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plan tasks" ON plan_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plan tasks" ON plan_tasks FOR UPDATE USING (auth.uid() = user_id);

-- Context Cache
CREATE POLICY "Users can view own context" ON context_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own context" ON context_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context" ON context_cache FOR UPDATE USING (auth.uid() = user_id);

-- Daily Insights
CREATE POLICY "Users can view own insights" ON daily_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON daily_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON daily_insights FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS FOR AUTOMATION
-- ============================================================

-- Function to update session on new message
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions 
    SET updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_session ON conversations;
CREATE TRIGGER trigger_update_session
AFTER INSERT ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_session_on_message();

-- Function to auto-generate session title from first message
CREATE OR REPLACE FUNCTION set_default_session_title()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.title IS NULL OR NEW.title = 'New Chat' THEN
        NEW.title := 'New Chat';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_default_session_title ON chat_sessions;
CREATE TRIGGER trigger_default_session_title
BEFORE INSERT ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION set_default_session_title();
