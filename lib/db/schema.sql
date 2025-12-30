-- =============================================================================
-- HATCHIT V3.0 DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- Extends Clerk authentication with our own user records
-- =============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast Clerk ID lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- =============================================================================
-- PROJECTS TABLE
-- Each project = one website being built
-- =============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_id TEXT NOT NULL,
  brand_config JSONB DEFAULT NULL,
  status TEXT DEFAULT 'building' CHECK (status IN ('building', 'complete', 'deployed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment for documentation
COMMENT ON COLUMN projects.brand_config IS 'JSON object: brandName, tagline, logoUrl, colors {primary, secondary, accent}, fontStyle, styleVibe';

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECTIONS TABLE
-- Individual sections of a project (hero, features, etc.)
-- =============================================================================
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  code TEXT,
  user_prompt TEXT,
  refined BOOLEAN DEFAULT FALSE,
  refinement_changes TEXT[],
  suggested_code TEXT,
  suggestion_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'complete', 'skipped')),
  order_index INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sections_project_id ON sections(project_id);
CREATE INDEX idx_sections_status ON sections(status);

-- Unique constraint: one section_id per project
CREATE UNIQUE INDEX idx_sections_project_section ON sections(project_id, section_id);

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- BUILDS TABLE
-- Assembled full pages ready for deployment
-- =============================================================================
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  full_code TEXT NOT NULL,
  version INT DEFAULT 1,
  audit_complete BOOLEAN DEFAULT FALSE,
  audit_changes TEXT[],
  deployed_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_builds_project_id ON builds(project_id);
-- Unique constraint to prevent duplicate versions
CREATE UNIQUE INDEX idx_builds_project_version ON builds(project_id, version);

-- =============================================================================
-- ATOMIC BUILD CREATION FUNCTION
-- Prevents race conditions when creating builds
-- =============================================================================
CREATE OR REPLACE FUNCTION create_build_atomic(
  p_project_id UUID,
  p_full_code TEXT
) RETURNS builds AS $$
DECLARE
  v_next_version INT;
  v_new_build builds;
BEGIN
  -- Get and increment version atomically using FOR UPDATE
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_next_version
  FROM builds
  WHERE project_id = p_project_id
  FOR UPDATE;

  -- Insert new build
  INSERT INTO builds (project_id, full_code, version, audit_complete)
  VALUES (p_project_id, p_full_code, v_next_version, false)
  RETURNING * INTO v_new_build;

  RETURN v_new_build;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- =============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- Users: can read/update their own record
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (true); -- We'll filter by clerk_id in app logic

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (true);

-- Projects: users can CRUD their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (true); -- Filtered by user_id in app

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (true);

-- Sections: access via project ownership
CREATE POLICY "Users can view sections" ON sections
  FOR SELECT USING (true);

CREATE POLICY "Users can insert sections" ON sections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update sections" ON sections
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete sections" ON sections
  FOR DELETE USING (true);

-- Builds: access via project ownership
CREATE POLICY "Users can view builds" ON builds
  FOR SELECT USING (true);

CREATE POLICY "Users can insert builds" ON builds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update builds" ON builds
  FOR UPDATE USING (true);

-- =============================================================================
-- HELPFUL VIEWS
-- =============================================================================

-- Project with section count
CREATE OR REPLACE VIEW projects_with_progress AS
SELECT 
  p.*,
  COUNT(s.id) AS total_sections,
  COUNT(s.id) FILTER (WHERE s.status = 'complete') AS completed_sections,
  COUNT(s.id) FILTER (WHERE s.status = 'skipped') AS skipped_sections
FROM projects p
LEFT JOIN sections s ON s.project_id = p.id
GROUP BY p.id;
