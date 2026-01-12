-- Migration: Add ai_feedback column to journals table
-- This column stores the AI-generated reflection for journal entries

-- Add ai_feedback column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journals' AND column_name = 'ai_feedback'
    ) THEN
        ALTER TABLE journals ADD COLUMN ai_feedback TEXT;
    END IF;
END $$;

-- Also ensure ai_analysis column exists (for frontend compatibility)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journals' AND column_name = 'ai_analysis'
    ) THEN
        ALTER TABLE journals ADD COLUMN ai_analysis TEXT;
    END IF;
END $$;
