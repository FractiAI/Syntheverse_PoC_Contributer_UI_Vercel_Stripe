-- Ensure Row Level Security (RLS) is enabled on allocations table
-- This migration is idempotent and can be run multiple times safely

-- Enable RLS on allocations table (if not already enabled)
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own allocations" ON public.allocations;
DROP POLICY IF EXISTS "Service role full access to allocations" ON public.allocations;
DROP POLICY IF EXISTS "Public can read allocations for qualified contributions" ON public.allocations;

-- Policy: Users can read their own allocations
CREATE POLICY "Users can read own allocations"
ON public.allocations
FOR SELECT
USING (
    auth.uid()::text = contributor 
    OR auth.jwt() ->> 'email' = contributor
);

-- Policy: Public can read allocations for qualified contributions (for transparency)
CREATE POLICY "Public can read allocations for qualified contributions"
ON public.allocations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.contributions c
        WHERE c.submission_hash = allocations.submission_hash
        AND c.status IN ('qualified', 'evaluated', 'archived')
    )
);

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role full access to allocations"
ON public.allocations
FOR ALL
USING (auth.role() = 'service_role');

-- Verify RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public' 
        AND t.tablename = 'allocations'
        AND c.relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS was not successfully enabled on allocations table';
    END IF;
END $$;
