-- ============================================================================
-- Add Vector Embedding and 3D Coordinate Columns to Contributions Table
-- ============================================================================
-- Purpose: Enable 3D vectorization of PoC submissions in the holographic
--          hydrogen fractal sandbox for redundancy calculation and visualization
--
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- Add columns for vector embeddings (stored as JSONB array) and 3D coordinates
ALTER TABLE "contributions" 
ADD COLUMN IF NOT EXISTS "embedding" jsonb,
ADD COLUMN IF NOT EXISTS "vector_x" numeric(20, 10),
ADD COLUMN IF NOT EXISTS "vector_y" numeric(20, 10),
ADD COLUMN IF NOT EXISTS "vector_z" numeric(20, 10),
ADD COLUMN IF NOT EXISTS "embedding_model" text,
ADD COLUMN IF NOT EXISTS "vector_generated_at" timestamp;

-- ============================================================================
-- Create Indexes for Vector Coordinates
-- ============================================================================
-- Note: PostgreSQL's point type only supports 2D (x, y), not 3D (x, y, z)
-- Therefore, we create individual column indexes and a composite index
-- 3D distance calculations are performed in application code
-- ============================================================================

-- Individual coordinate indexes for range queries and sorting
CREATE INDEX IF NOT EXISTS "contributions_vector_x_idx" ON "contributions" (vector_x) 
WHERE vector_x IS NOT NULL;

CREATE INDEX IF NOT EXISTS "contributions_vector_y_idx" ON "contributions" (vector_y) 
WHERE vector_y IS NOT NULL;

CREATE INDEX IF NOT EXISTS "contributions_vector_z_idx" ON "contributions" (vector_z) 
WHERE vector_z IS NOT NULL;

-- Composite index for queries filtering on all three coordinates
CREATE INDEX IF NOT EXISTS "contributions_vector_xyz_idx" ON "contributions" (vector_x, vector_y, vector_z) 
WHERE vector_x IS NOT NULL AND vector_y IS NOT NULL AND vector_z IS NOT NULL;

-- ============================================================================
-- Optional: pgvector Extension Support (if available)
-- ============================================================================
-- If pgvector extension is installed, uncomment the following to enable
-- efficient vector similarity search on embeddings:
--
-- CREATE INDEX IF NOT EXISTS "contributions_embedding_idx" 
-- ON "contributions" USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);
-- ============================================================================

-- ============================================================================
-- Column Comments (Documentation)
-- ============================================================================

COMMENT ON COLUMN "contributions"."embedding" IS 
'Vector embedding as JSONB array for semantic similarity. Generated using OpenAI embeddings API or fallback hash-based method.';

COMMENT ON COLUMN "contributions"."vector_x" IS 
'X coordinate in 3D holographic hydrogen fractal sandbox. Represents Novelty dimension (0-2500 score mapped to ~0-200 range using HHF constant Λᴴᴴ ≈ 1.12 × 10²²).';

COMMENT ON COLUMN "contributions"."vector_y" IS 
'Y coordinate in 3D holographic hydrogen fractal sandbox. Represents Density dimension (0-2500 score mapped to ~0-200 range using HHF constant Λᴴᴴ ≈ 1.12 × 10²²).';

COMMENT ON COLUMN "contributions"."vector_z" IS 
'Z coordinate in 3D holographic hydrogen fractal sandbox. Represents Coherence dimension (0-2500 score mapped to ~0-200 range using HHF constant Λᴴᴴ ≈ 1.12 × 10²²).';

COMMENT ON COLUMN "contributions"."embedding_model" IS 
'Model used to generate embedding (e.g., "text-embedding-3-small", "fallback-hash").';

COMMENT ON COLUMN "contributions"."vector_generated_at" IS 
'Timestamp when vector embedding and 3D coordinates were generated.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Verify columns were added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'contributions' 
-- AND column_name LIKE 'vector%' OR column_name = 'embedding';
-- ============================================================================

