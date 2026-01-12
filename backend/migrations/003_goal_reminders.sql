-- Goal Reminder System Enhancement
-- Adds fields for smart, non-intrusive goal reminders

-- Add reminder tracking to therapeutic_goals
ALTER TABLE therapeutic_goals 
ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'; -- 'manual' or 'ai_suggested'

-- Table for AI-suggested goals awaiting user approval
CREATE TABLE IF NOT EXISTS suggested_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    category TEXT,
    detected_from_message TEXT, -- The message that triggered detection
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Index for pending suggestions
CREATE INDEX IF NOT EXISTS idx_suggested_goals_pending 
ON suggested_goals(user_id, status) WHERE status = 'pending';

-- RLS for suggested_goals
ALTER TABLE suggested_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions" 
ON suggested_goals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions" 
ON suggested_goals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert suggestions" 
ON suggested_goals FOR INSERT WITH CHECK (true);
