-- Migration: Create Social Media Tables for Sandbox-Based Community Feeds
-- Created: January 2025
-- Description: Enables sandbox-linked social media posts, likes, and comments

-- Create social_posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id TEXT PRIMARY KEY,
  sandbox_id TEXT, -- null = syntheverse (default), otherwise enterprise_sandboxes.id
  author_email TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('contributor', 'operator', 'creator')),
  content TEXT NOT NULL, -- Post text content
  image_url TEXT, -- URL to uploaded image (stored in Supabase Storage)
  image_path TEXT, -- Storage path for image
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE, -- For sandbox operators/creators to pin posts
  is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create social_post_likes table
CREATE TABLE IF NOT EXISTS public.social_post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_email) -- Prevent duplicate likes
);

-- Create social_post_comments table
CREATE TABLE IF NOT EXISTS public.social_post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('contributor', 'operator', 'creator')),
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_social_posts_sandbox_id ON public.social_posts(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_author_email ON public.social_posts(author_email);
CREATE INDEX IF NOT EXISTS idx_social_posts_sandbox_created ON public.social_posts(sandbox_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_not_deleted ON public.social_posts(sandbox_id, created_at DESC) WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_id ON public.social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user_email ON public.social_post_likes(user_email);

CREATE INDEX IF NOT EXISTS idx_social_post_comments_post_id ON public.social_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_comments_created_at ON public.social_post_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_post_comments_not_deleted ON public.social_post_comments(post_id, created_at DESC) WHERE is_deleted = FALSE;

-- Enable Row Level Security
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_posts
-- Users can view posts in accessible sandboxes (filtering done in API)
CREATE POLICY "Users can view posts"
  ON public.social_posts FOR SELECT
  USING (auth.role() = 'authenticated' AND is_deleted = FALSE);

-- Users can create posts
CREATE POLICY "Users can create posts"
  ON public.social_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.email() = author_email);

-- Users can update own posts or operators can moderate
CREATE POLICY "Users can update own posts or operators can moderate"
  ON public.social_posts FOR UPDATE
  USING (
    (auth.email() = author_email) OR
    EXISTS (
      SELECT 1 FROM public.enterprise_sandboxes 
      WHERE id = sandbox_id 
      AND (operator = auth.email() OR EXISTS (
        SELECT 1 FROM public.users_table 
        WHERE email = auth.email() 
        AND role = 'creator'
      ))
    )
  );

-- Users can delete own posts or operators can delete
CREATE POLICY "Users can delete own posts or operators can delete"
  ON public.social_posts FOR DELETE
  USING (
    (auth.email() = author_email) OR
    EXISTS (
      SELECT 1 FROM public.enterprise_sandboxes 
      WHERE id = sandbox_id 
      AND (operator = auth.email() OR EXISTS (
        SELECT 1 FROM public.users_table 
        WHERE email = auth.email() 
        AND role = 'creator'
      ))
    )
  );

-- RLS Policies for social_post_likes
CREATE POLICY "Users can like posts"
  ON public.social_post_likes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated' AND auth.email() = user_email);

-- RLS Policies for social_post_comments
CREATE POLICY "Users can view comments"
  ON public.social_post_comments FOR SELECT
  USING (auth.role() = 'authenticated' AND is_deleted = FALSE);

CREATE POLICY "Users can create comments"
  ON public.social_post_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.email() = author_email);

CREATE POLICY "Users can update own comments"
  ON public.social_post_comments FOR UPDATE
  USING (auth.email() = author_email);

CREATE POLICY "Users can delete own comments"
  ON public.social_post_comments FOR DELETE
  USING (auth.email() = author_email);

-- Function to update likes_count when likes are added/removed
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update likes_count
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON public.social_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Function to update comments_count when comments are added/removed
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete
    IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
      UPDATE public.social_posts
      SET comments_count = GREATEST(0, comments_count - 1)
      WHERE id = NEW.post_id;
    ELSIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
      UPDATE public.social_posts
      SET comments_count = comments_count + 1
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update comments_count
CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE OR UPDATE ON public.social_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

