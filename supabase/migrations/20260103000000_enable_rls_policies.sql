-- Enable Row Level Security (RLS) for all public tables
-- This migration enables RLS and creates appropriate policies for each table

-- ============================================
-- 1. Enable RLS on all tables
-- ============================================

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epoch_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epoch_metal_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poc_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Contributions Table Policies
-- ============================================

-- Policy: Users can read their own contributions
CREATE POLICY "Users can read own contributions"
ON public.contributions
FOR SELECT
USING (auth.uid()::text = contributor OR auth.jwt() ->> 'email' = contributor);

-- Policy: Users can read all qualified contributions (public archive)
CREATE POLICY "Public can read qualified contributions"
ON public.contributions
FOR SELECT
USING (status IN ('qualified', 'evaluated', 'archived'));

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role full access to contributions"
ON public.contributions
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 3. Allocations Table Policies
-- ============================================

-- Policy: Users can read their own allocations
CREATE POLICY "Users can read own allocations"
ON public.allocations
FOR SELECT
USING (auth.uid()::text = contributor OR auth.jwt() ->> 'email' = contributor);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access to allocations"
ON public.allocations
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 4. Epoch Balances Table Policies
-- ============================================

-- Policy: Public read access (tokenomics state is public)
CREATE POLICY "Public can read epoch balances"
ON public.epoch_balances
FOR SELECT
USING (true);

-- Policy: Service role can update
CREATE POLICY "Service role can update epoch balances"
ON public.epoch_balances
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 5. Epoch Metal Balances Table Policies
-- ============================================

-- Policy: Public read access (tokenomics state is public)
CREATE POLICY "Public can read epoch metal balances"
ON public.epoch_metal_balances
FOR SELECT
USING (true);

-- Policy: Service role can update
CREATE POLICY "Service role can update epoch metal balances"
ON public.epoch_metal_balances
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 6. Users Table Policies
-- ============================================

-- Policy: Users can read their own user record
CREATE POLICY "Users can read own user record"
ON public.users_table
FOR SELECT
USING (auth.uid()::text = id OR auth.jwt() ->> 'email' = email);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access to users_table"
ON public.users_table
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 7. PoC Log Table Policies
-- ============================================

-- Policy: Users can read logs related to their contributions
CREATE POLICY "Users can read own contribution logs"
ON public.poc_log
FOR SELECT
USING (
    auth.uid()::text = (metadata->>'contributor')::text 
    OR auth.jwt() ->> 'email' = (metadata->>'contributor')::text
);

-- Policy: Public can read logs for qualified contributions
CREATE POLICY "Public can read logs for qualified contributions"
ON public.poc_log
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.contributions c
        WHERE c.submission_hash = poc_log.submission_hash
        AND c.status IN ('qualified', 'evaluated', 'archived')
    )
);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access to poc_log"
ON public.poc_log
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- Notes:
-- ============================================
-- - All tables now have RLS enabled
-- - Policies allow appropriate access patterns:
--   * Users can read their own data
--   * Public can read qualified contributions and tokenomics state
--   * Service role (API routes) has full access
-- - For password compromise checking, enable it in Supabase Dashboard:
--   Authentication → Settings → Password → Enable "Check passwords against HaveIBeenPwned"

