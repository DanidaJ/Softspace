-- Therapeutic Memory System
-- Adds tables for long-term therapeutic continuity

-- ============================================================
-- THERAPEUTIC GOALS - User-set goals (never AI-assigned)
-- ============================================================
CREATE TABLE IF NOT EXISTS therapeutic_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    category TEXT, -- 'anxiety', 'sleep', 'stress', 'relationships', 'self-esteem', 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    progress_notes TEXT[], -- Array of progress reflections
    last_referenced_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- RECURRING THEMES - Track topics that come up repeatedly
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_themes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL, -- 'work stress', 'family conflict', 'loneliness', etc.
    mention_count INTEGER DEFAULT 1,
    first_mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_ids INTEGER[], -- Which sessions mentioned this theme
    emotional_context TEXT[], -- Emotions associated with this theme
    UNIQUE(user_id, theme)
);

-- ============================================================
-- EMOTIONAL TRAJECTORY - Track emotional patterns over time
-- ============================================================
CREATE TABLE IF NOT EXISTS emotional_trajectory (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    avg_mood_score DECIMAL(3,1),
    primary_emotions TEXT[],
    message_count INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    top_themes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_start, period_type)
);

-- ============================================================
-- PATTERN MARKERS - Detect recurring negative patterns
-- ============================================================
CREATE TABLE IF NOT EXISTS pattern_markers (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'spiral', 'avoidance', 'catastrophizing', 'self-criticism'
    trigger_theme TEXT, -- What theme triggers this pattern
    occurrence_count INTEGER DEFAULT 1,
    last_occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    intervention_shown BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SIGNIFICANT MOMENTS - AI-detected breakthrough/important moments
-- ============================================================
CREATE TABLE IF NOT EXISTS significant_moments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE SET NULL,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
    moment_type TEXT NOT NULL, -- 'breakthrough', 'insight', 'vulnerability', 'strength', 'progress'
    summary TEXT NOT NULL,
    user_message_excerpt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_therapeutic_goals_user ON therapeutic_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_themes_user ON recurring_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_themes_count ON recurring_themes(user_id, mention_count DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_trajectory_user ON emotional_trajectory(user_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_pattern_markers_user ON pattern_markers(user_id);
CREATE INDEX IF NOT EXISTS idx_significant_moments_user ON significant_moments(user_id, created_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE therapeutic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_trajectory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE significant_moments ENABLE ROW LEVEL SECURITY;

-- Policies for therapeutic_goals
CREATE POLICY "Users can view own goals" ON therapeutic_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON therapeutic_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON therapeutic_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON therapeutic_goals FOR DELETE USING (auth.uid() = user_id);

-- Policies for recurring_themes
CREATE POLICY "Users can view own themes" ON recurring_themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own themes" ON recurring_themes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own themes" ON recurring_themes FOR UPDATE USING (auth.uid() = user_id);

-- Policies for emotional_trajectory  
CREATE POLICY "Users can view own trajectory" ON emotional_trajectory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trajectory" ON emotional_trajectory FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for pattern_markers
CREATE POLICY "Users can view own patterns" ON pattern_markers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patterns" ON pattern_markers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patterns" ON pattern_markers FOR UPDATE USING (auth.uid() = user_id);

-- Policies for significant_moments
CREATE POLICY "Users can view own moments" ON significant_moments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own moments" ON significant_moments FOR INSERT WITH CHECK (auth.uid() = user_id);
