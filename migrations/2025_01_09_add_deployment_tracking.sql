-- =============================================================================
-- MIGRATION: Add deployment tracking columns to builds table
-- Date: 2025-01-09
-- Purpose: Track deployment status, errors, and logs for better debugging
-- =============================================================================

-- Add new columns to builds table
ALTER TABLE builds 
ADD COLUMN IF NOT EXISTS deployment_id TEXT,
ADD COLUMN IF NOT EXISTS deploy_status TEXT CHECK (deploy_status IN ('pending', 'building', 'ready', 'failed')),
ADD COLUMN IF NOT EXISTS deploy_error TEXT,
ADD COLUMN IF NOT EXISTS deploy_logs_url TEXT,
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMPTZ;

-- Add index for faster lookups by deployment status
CREATE INDEX IF NOT EXISTS idx_builds_deploy_status ON builds(deploy_status);

-- Add comment for documentation
COMMENT ON COLUMN builds.deployment_id IS 'Vercel deployment ID for status tracking';
COMMENT ON COLUMN builds.deploy_status IS 'Current deployment state: pending, building, ready, or failed';
COMMENT ON COLUMN builds.deploy_error IS 'Error message if deployment failed';
COMMENT ON COLUMN builds.deploy_logs_url IS 'URL to Vercel build logs for debugging';
COMMENT ON COLUMN builds.deployed_at IS 'Timestamp when deployment succeeded';
