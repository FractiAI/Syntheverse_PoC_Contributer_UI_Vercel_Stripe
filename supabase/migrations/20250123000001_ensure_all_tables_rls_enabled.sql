-- Comprehensive RLS migration for all public tables
-- This ensures RLS is enabled on all tables that need it
-- Idempotent - can be run multiple times safely

-- ============================================
-- Core PoC Tables (already covered, but ensuring they're enabled)
-- ============================================
ALTER TABLE IF EXISTS public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.epoch_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.epoch_metal_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.poc_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Enterprise Tables
-- ============================================
ALTER TABLE IF EXISTS public.enterprise_sandboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enterprise_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enterprise_allocations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- System & Broadcast Tables
-- ============================================
ALTER TABLE IF EXISTS public.system_broadcasts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Social Media Tables
-- ============================================
ALTER TABLE IF EXISTS public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_post_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Blog Tables
-- ============================================
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Chat Tables
-- ============================================
ALTER TABLE IF EXISTS public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Audit & Metrics Tables
-- ============================================
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sandbox_synth_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sandbox_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Note: tokenomics table typically doesn't need RLS
-- as it's a single-row configuration table, but if needed:
-- ALTER TABLE IF EXISTS public.tokenomics ENABLE ROW LEVEL SECURITY;
-- ============================================

-- Verify RLS is enabled on key tables
DO $$
DECLARE
    table_name text;
    tables_to_check text[] := ARRAY[
        'contributions', 'allocations', 'epoch_balances', 'epoch_metal_balances',
        'users_table', 'poc_log', 'enterprise_sandboxes', 'enterprise_contributions',
        'enterprise_allocations', 'system_broadcasts', 'social_posts',
        'social_post_likes', 'social_post_comments', 'blog_posts', 'blog_permissions',
        'chat_rooms', 'chat_messages', 'chat_participants', 'audit_log',
        'sandbox_synth_transactions', 'sandbox_metrics'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = table_name
        ) THEN
            IF NOT EXISTS (
                SELECT 1 
                FROM pg_tables t
                JOIN pg_class c ON c.relname = t.tablename
                WHERE t.schemaname = 'public' 
                AND t.tablename = table_name
                AND c.relrowsecurity = true
            ) THEN
                RAISE WARNING 'RLS was not successfully enabled on table: %', table_name;
            END IF;
        END IF;
    END LOOP;
END $$;

