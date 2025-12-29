-- =============================================================================
-- MIGRATION: Add generation tracking to users table
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Add columns for tracking daily generations
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_generations INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_generation_date DATE DEFAULT CURRENT_DATE;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_generation_date ON users(last_generation_date);

-- Function to check and increment generation count (atomic operation)
CREATE OR REPLACE FUNCTION check_and_increment_generation(
  p_clerk_id TEXT,
  p_daily_limit INT DEFAULT 5
)
RETURNS TABLE(allowed BOOLEAN, remaining INT, reset_today BOOLEAN) AS $$
DECLARE
  v_user_id UUID;
  v_current_count INT;
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get user record with lock
  SELECT id, daily_generations, last_generation_date
  INTO v_user_id, v_current_count, v_last_date
  FROM users
  WHERE clerk_id = p_clerk_id
  FOR UPDATE;

  -- User not found
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, FALSE;
    RETURN;
  END IF;

  -- Check if we need to reset (new day)
  IF v_last_date IS NULL OR v_last_date < v_today THEN
    -- Reset count for new day
    UPDATE users
    SET daily_generations = 1, last_generation_date = v_today
    WHERE id = v_user_id;
    
    RETURN QUERY SELECT TRUE, p_daily_limit - 1, TRUE;
    RETURN;
  END IF;

  -- Same day - check limit
  IF v_current_count >= p_daily_limit THEN
    RETURN QUERY SELECT FALSE, 0, FALSE;
    RETURN;
  END IF;

  -- Increment count
  UPDATE users
  SET daily_generations = daily_generations + 1
  WHERE id = v_user_id;

  RETURN QUERY SELECT TRUE, p_daily_limit - v_current_count - 1, FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (if using Supabase auth)
-- GRANT EXECUTE ON FUNCTION check_and_increment_generation TO authenticated;

