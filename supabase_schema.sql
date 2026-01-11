-- =============================================================================
-- HATCHIT SINGULARITY SCHEMA v1.0
-- =============================================================================

-- 1. USERS TABLE (Synced with Clerk via Webhook or created on first login)
create table public.users (
  id uuid not null default gen_random_uuid(),
  clerk_id text not null unique,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Singularity Profile
  tier text default 'free', -- 'free', 'architect', 'visionary', 'singularity'
  credits int default 0,
  style_dna jsonb, -- Stores vibe_keywords, preferred_colors, etc.
  
  primary key (id)
);

-- 2. PROJECTS TABLE (The Constructs)
create table public.projects (
  id text not null primary key, -- We use string IDs like 'proj_xyz'
  user_id text not null references public.users(clerk_id) on delete cascade,
  name text not null,
  
  -- Core Data
  description text,
  vibe text, -- 'cyberpunk', 'minimalist', etc.
  slug text, -- Internal slug for routing
  template_id text, -- ID of the template used
  brand_config jsonb, -- Stores colors, fonts, etc.
  status text default 'building', -- 'building', 'complete', 'deployed'
  
  -- Deployment
  deployed_slug text unique, -- 'my-site-123'
  deployed_at timestamptz,
  custom_domain text,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_archived boolean default false
);

-- 3. PAGES TABLE (Multi-page support)
create table public.pages (
  id text not null primary key,
  project_id text not null references public.projects(id) on delete cascade,
  name text not null, -- 'Home', 'About'
  path text not null, -- '/', '/about'
  
  -- The Code
  current_version_index int default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(project_id, path)
);

-- 4. VERSIONS TABLE (Time Travel / Undo History)
create table public.versions (
  id uuid not null default gen_random_uuid(),
  page_id text not null references public.pages(id) on delete cascade,
  
  code text not null, -- The full React component code
  prompt text, -- The prompt that generated this version
  
  created_at timestamptz default now(),
  
  -- Ordering
  version_index int not null
);

-- 5. SECTIONS TABLE (Granular Building Blocks)
create table public.sections (
  id uuid not null default gen_random_uuid(),
  project_id text not null references public.projects(id) on delete cascade,
  section_id text not null, -- 'hero', 'features', etc.
  order_index int not null,
  
  status text default 'pending', -- 'pending', 'building', 'complete', 'error'
  code text, -- The code for this specific section
  user_prompt text,
  refined boolean default false,
  refinement_changes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. BUILDS TABLE (Snapshots of assembled code)
create table public.builds (
  id uuid not null default gen_random_uuid(),
  project_id text not null references public.projects(id) on delete cascade,
  
  code text not null, -- The full assembled code
  version_number int not null,
  audit_score int,
  
  -- Deployment tracking
  deployment_id text,                                          -- Vercel deployment ID
  deploy_status text check (deploy_status in ('pending', 'building', 'ready', 'failed')),
  deploy_error text,                                           -- Error message if failed
  deploy_logs_url text,                                        -- Link to Vercel logs
  deployed_at timestamptz,                                     -- When deployment succeeded
  
  created_at timestamptz default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - The Immune System
-- =============================================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.pages enable row level security;
alter table public.versions enable row level security;
alter table public.sections enable row level security;
alter table public.builds enable row level security;

-- USERS: Can only read/update their own data
create policy "Users can read own data" on public.users
  for select using (auth.uid()::text = clerk_id);

create policy "Users can update own data" on public.users
  for update using (auth.uid()::text = clerk_id);
  
create policy "Users can insert own data" on public.users
  for insert with check (auth.uid()::text = clerk_id);

-- PROJECTS: Can only access projects where user_id matches their Clerk ID
create policy "Users can CRUD own projects" on public.projects
  for all using (auth.uid()::text = user_id);

-- PAGES: Can access pages if they own the parent project
create policy "Users can CRUD own pages" on public.pages
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = pages.project_id
      and projects.user_id = auth.uid()::text
    )
  );

-- VERSIONS: Can access versions if they own the parent page -> project
create policy "Users can CRUD own versions" on public.versions
  for all using (
    exists (
      select 1 from public.pages
      join public.projects on projects.id = pages.project_id
      where pages.id = versions.page_id
      and projects.user_id = auth.uid()::text
    )
  );

-- SECTIONS: Can access sections if they own the parent project
create policy "Users can CRUD own sections" on public.sections
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = sections.project_id
      and projects.user_id = auth.uid()::text
    )
  );

-- BUILDS: Can access builds if they own the parent project
create policy "Users can CRUD own builds" on public.builds
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = builds.project_id
      and projects.user_id = auth.uid()::text
    )
  );

  for all using (
    exists (
      select 1 from public.pages
      join public.projects on projects.id = pages.project_id
      where pages.id = versions.page_id
      and projects.user_id = auth.uid()::text
    )
  );

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on public.users
  for each row execute procedure update_updated_at_column();

create trigger update_projects_updated_at before update on public.projects
  for each row execute procedure update_updated_at_column();

create trigger update_pages_updated_at before update on public.pages
  for each row execute procedure update_updated_at_column();
