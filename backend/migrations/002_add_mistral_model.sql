-- Migration: Add 'mistral' to allowed model_used values
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE conversations 
DROP CONSTRAINT IF EXISTS conversations_model_used_check;

-- Add new constraint with 'mistral' included
ALTER TABLE conversations 
ADD CONSTRAINT conversations_model_used_check 
CHECK (model_used IN ('gemini', 'groq', 'mistral'));

-- Verify the change
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'conversations'::regclass 
AND conname = 'conversations_model_used_check';
