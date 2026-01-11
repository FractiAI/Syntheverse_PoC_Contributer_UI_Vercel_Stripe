-- ============================================================================
-- Hero/Story Catalog System - Database Migration
-- Date: January 10, 2026
-- Purpose: Create tables for hero/story catalog with AI-assisted interactions
-- ============================================================================

-- Hero Catalog Table
CREATE TABLE IF NOT EXISTS hero_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  icon TEXT,
  role TEXT NOT NULL,
  
  default_system_prompt TEXT NOT NULL,
  prompt_version TEXT DEFAULT 'v1.0.0',
  
  assigned_pages JSONB DEFAULT '[]'::jsonb,
  assigned_pillars JSONB DEFAULT '[]'::jsonb,
  
  metadata JSONB,
  
  status TEXT NOT NULL DEFAULT 'draft',
  is_public BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_by TEXT NOT NULL,
  updated_by TEXT,
  
  total_interactions INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Story Catalog Table
CREATE TABLE IF NOT EXISTS story_catalog (
  id TEXT PRIMARY KEY,
  hero_id TEXT NOT NULL REFERENCES hero_catalog(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  
  story_prompt TEXT NOT NULL,
  story_context TEXT,
  interaction_goals JSONB,
  
  ai_model TEXT DEFAULT 'llama-3.3-70b-versatile',
  temperature NUMERIC(3, 2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 500,
  
  metadata JSONB,
  
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  created_by TEXT NOT NULL,
  updated_by TEXT,
  
  total_completions INTEGER DEFAULT 0,
  total_starts INTEGER DEFAULT 0,
  average_completion_time_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Hero Sessions Table (Active AI Interactions)
CREATE TABLE IF NOT EXISTS hero_sessions (
  id TEXT PRIMARY KEY,
  
  hero_id TEXT NOT NULL REFERENCES hero_catalog(id),
  story_id TEXT REFERENCES story_catalog(id),
  user_email TEXT NOT NULL,
  
  system_prompt TEXT NOT NULL,
  session_type TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  
  messages JSONB DEFAULT '[]'::jsonb,
  
  metadata JSONB,
  
  launched_by_operator TEXT,
  is_operator_session BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Hero Analytics Table
CREATE TABLE IF NOT EXISTS hero_analytics (
  id TEXT PRIMARY KEY,
  
  hero_id TEXT NOT NULL,
  story_id TEXT,
  session_id TEXT,
  user_email TEXT NOT NULL,
  
  event_type TEXT NOT NULL,
  event_data JSONB,
  
  event_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI Prompt Templates Table (Creator Tool)
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id TEXT PRIMARY KEY,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  template_prompt TEXT NOT NULL,
  variables JSONB,
  
  generated_by_ai BOOLEAN DEFAULT false,
  ai_generation_prompt TEXT,
  
  times_used INTEGER DEFAULT 0,
  
  created_by TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Hero catalog indexes
CREATE INDEX IF NOT EXISTS idx_hero_catalog_status ON hero_catalog(status);
CREATE INDEX IF NOT EXISTS idx_hero_catalog_created_by ON hero_catalog(created_by);
CREATE INDEX IF NOT EXISTS idx_hero_catalog_public ON hero_catalog(is_public) WHERE is_public = true;

-- Story catalog indexes
CREATE INDEX IF NOT EXISTS idx_story_catalog_hero_id ON story_catalog(hero_id);
CREATE INDEX IF NOT EXISTS idx_story_catalog_status ON story_catalog(status);
CREATE INDEX IF NOT EXISTS idx_story_catalog_featured ON story_catalog(is_featured) WHERE is_featured = true;

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_hero_sessions_user_email ON hero_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_hero_sessions_hero_id ON hero_sessions(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_sessions_status ON hero_sessions(status);
CREATE INDEX IF NOT EXISTS idx_hero_sessions_started_at ON hero_sessions(started_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_hero_analytics_hero_id ON hero_analytics(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_analytics_event_type ON hero_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_hero_analytics_event_timestamp ON hero_analytics(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hero_analytics_user_email ON hero_analytics(user_email);

-- Prompt templates indexes
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON ai_prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_public ON ai_prompt_templates(is_public) WHERE is_public = true;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE hero_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;

-- Hero Catalog Policies
-- Anyone authenticated can view public heroes
CREATE POLICY "Anyone authenticated can view public heroes"
ON hero_catalog FOR SELECT
TO authenticated
USING (is_public = true OR created_by = auth.jwt() ->> 'email');

-- Only creators can insert/update/delete heroes
CREATE POLICY "Only creators can manage heroes"
ON hero_catalog FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND users_table.role = 'creator'
  )
);

-- Story Catalog Policies
-- Anyone authenticated can view stories of public heroes
CREATE POLICY "Anyone authenticated can view stories"
ON story_catalog FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hero_catalog
    WHERE hero_catalog.id = story_catalog.hero_id
    AND (hero_catalog.is_public = true OR hero_catalog.created_by = auth.jwt() ->> 'email')
  )
);

-- Only creators can manage stories
CREATE POLICY "Only creators can manage stories"
ON story_catalog FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND users_table.role = 'creator'
  )
);

-- Hero Sessions Policies
-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON hero_sessions FOR SELECT
TO authenticated
USING (user_email = auth.jwt() ->> 'email');

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions"
ON hero_sessions FOR INSERT
TO authenticated
WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON hero_sessions FOR UPDATE
TO authenticated
USING (user_email = auth.jwt() ->> 'email');

-- Operators can view all sessions
CREATE POLICY "Operators can view all sessions"
ON hero_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND (users_table.role = 'operator' OR users_table.role = 'creator')
  )
);

-- Operators can create sessions for users
CREATE POLICY "Operators can create sessions"
ON hero_sessions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND (users_table.role = 'operator' OR users_table.role = 'creator')
  )
);

-- Hero Analytics Policies
-- Users can view their own analytics
CREATE POLICY "Users can view own analytics"
ON hero_analytics FOR SELECT
TO authenticated
USING (user_email = auth.jwt() ->> 'email');

-- Anyone authenticated can insert analytics
CREATE POLICY "Anyone authenticated can insert analytics"
ON hero_analytics FOR INSERT
TO authenticated
WITH CHECK (true);

-- Operators and creators can view all analytics
CREATE POLICY "Operators can view all analytics"
ON hero_analytics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND (users_table.role = 'operator' OR users_table.role = 'creator')
  )
);

-- AI Prompt Templates Policies
-- Anyone authenticated can view public templates
CREATE POLICY "Anyone authenticated can view public templates"
ON ai_prompt_templates FOR SELECT
TO authenticated
USING (is_public = true OR created_by = auth.jwt() ->> 'email');

-- Only creators can manage templates
CREATE POLICY "Only creators can manage templates"
ON ai_prompt_templates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND users_table.role = 'creator'
  )
);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE hero_catalog IS 'Hero characters with AI system prompts and page assignments';
COMMENT ON TABLE story_catalog IS 'Story narratives and interaction flows for heroes';
COMMENT ON TABLE hero_sessions IS 'Active AI interaction sessions between users and heroes';
COMMENT ON TABLE hero_analytics IS 'Event tracking for hero interactions and engagement metrics';
COMMENT ON TABLE ai_prompt_templates IS 'Reusable AI prompt templates for creators';

-- ============================================================================
-- Seed Data: Default Heroes
-- ============================================================================

-- Insert default hero: Synthia (The Guide)
INSERT INTO hero_catalog (
  id,
  name,
  tagline,
  icon,
  role,
  default_system_prompt,
  prompt_version,
  assigned_pages,
  assigned_pillars,
  metadata,
  status,
  is_public,
  is_default,
  created_by
) VALUES (
  'hero-synthia-guide',
  'Synthia',
  'Your guide through the Syntheverse',
  '🌟',
  'guide',
  'You are Synthia, a knowledgeable and friendly guide to the Syntheverse. You help users understand Proof-of-Contribution, HHF-AI evaluation, and token allocation. You communicate clearly, encourage exploration, and make complex concepts accessible. You celebrate user progress and provide actionable next steps.',
  'v1.0.0',
  '["landing", "onboarding", "dashboard"]'::jsonb,
  '["contributor", "operator", "creator"]'::jsonb,
  '{"personality_traits": ["friendly", "knowledgeable", "encouraging"], "expertise_areas": ["PoC submission", "HHF-AI", "tokenomics"], "communication_style": "clear and supportive", "interaction_mode": "conversational", "voice_tone": "warm and professional"}'::jsonb,
  'active',
  true,
  true,
  'system'
);

-- Insert default story: Welcome to Syntheverse
INSERT INTO story_catalog (
  id,
  hero_id,
  title,
  description,
  category,
  story_prompt,
  story_context,
  interaction_goals,
  metadata,
  status,
  is_featured,
  display_order,
  created_by
) VALUES (
  'story-welcome-syntheverse',
  'hero-synthia-guide',
  'Welcome to Syntheverse',
  'Learn the basics of Proof-of-Contribution and how to get started',
  'tutorial',
  'Guide the user through their first steps in Syntheverse. Explain what PoC submissions are, how HHF-AI evaluation works, and what they can achieve. Ask about their goals and provide personalized guidance. Keep responses concise (2-3 paragraphs) and actionable.',
  'This is a new user who has just signed up. They may be a researcher, developer, or creator interested in contributing to the ecosystem.',
  '["Understand PoC basics", "Learn about HHF-AI", "Submit first contribution", "Explore dashboard features"]'::jsonb,
  '{"difficulty_level": "beginner", "estimated_duration_minutes": 10, "tags": ["onboarding", "tutorial", "getting-started"], "learning_outcomes": ["Understand PoC concept", "Navigate dashboard", "Know how to submit"]}'::jsonb,
  'active',
  true,
  1,
  'system'
);

-- ============================================================================
-- Complete
-- ============================================================================

