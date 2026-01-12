-- ============================================================
-- MIGRATION: Add Growth Plans and Plan Tasks tables
-- Run this in your Supabase SQL Editor
-- 
-- NOTE: Based on your current schema, you already have:
-- - chat_sessions ✓
-- - emotion_logs ✓  
-- - conversations with session_id ✓
-- - journals with prompt and ai_analysis ✓
-- - mood_logs with energy and stress ✓
--
-- This migration only adds the missing growth_plans and plan_tasks tables
-- ============================================================

-- 1. Create growth_plans table
CREATE TABLE IF NOT EXISTS growth_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    goal TEXT,
    focus_area TEXT NOT NULL,
    week_number INTEGER DEFAULT 1,
    progress INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create plan_tasks table
CREATE TABLE IF NOT EXISTS plan_tasks (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES growth_plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT DEFAULT 'checkin',
    status TEXT DEFAULT 'locked' CHECK (status IN ('completed', 'current', 'locked')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_growth_plans_user_id ON growth_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_tasks_user_id ON plan_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_tasks_plan_id ON plan_tasks(plan_id);

-- 4. Enable RLS on new tables
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for growth_plans
DROP POLICY IF EXISTS "Users can view own growth_plans" ON growth_plans;
CREATE POLICY "Users can view own growth_plans" ON growth_plans
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own growth_plans" ON growth_plans;
CREATE POLICY "Users can insert own growth_plans" ON growth_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own growth_plans" ON growth_plans;
CREATE POLICY "Users can update own growth_plans" ON growth_plans
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own growth_plans" ON growth_plans;
CREATE POLICY "Users can delete own growth_plans" ON growth_plans
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for plan_tasks
DROP POLICY IF EXISTS "Users can view own plan_tasks" ON plan_tasks;
CREATE POLICY "Users can view own plan_tasks" ON plan_tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own plan_tasks" ON plan_tasks;
CREATE POLICY "Users can insert own plan_tasks" ON plan_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own plan_tasks" ON plan_tasks;
CREATE POLICY "Users can update own plan_tasks" ON plan_tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own plan_tasks" ON plan_tasks;
CREATE POLICY "Users can delete own plan_tasks" ON plan_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Done! Your database now has growth_plans and plan_tasks tables.
