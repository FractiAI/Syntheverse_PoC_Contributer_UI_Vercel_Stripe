-- ============================================
-- COMPLETE GROK API ERROR ANALYSIS - ALL IN ONE
-- ============================================
-- Copy and paste this single query into Supabase SQL Editor
-- Shows everything you need to troubleshoot why scores are 0

WITH recent_failure AS (
    SELECT 
        pl.*
    FROM poc_log pl
    WHERE pl.event_type = 'evaluation_failed'
        AND pl.response_data IS NOT NULL
    ORDER BY pl.created_at DESC
    LIMIT 1
),
contribution_info AS (
    SELECT 
        c.*
    FROM contributions c
    WHERE c.status = 'evaluation_failed'
        AND (
            c.metadata->'error_details' IS NOT NULL
            OR c.metadata->'full_grok_response' IS NOT NULL
            OR c.metadata->>'raw_grok_answer' IS NOT NULL
        )
    ORDER BY c.created_at DESC
    LIMIT 1
)
SELECT 
    -- Basic Info
    rf.submission_hash,
    rf.title,
    rf.created_at as "log_created_at",
    rf.event_type,
    rf.event_status,
    rf.error_message,
    
    -- Error Summary
    rf.response_data->>'error' as "error",
    rf.response_data->>'error_type' as "error_type",
    
    -- What Data We Have (Boolean flags)
    (rf.response_data->>'raw_grok_answer') IS NOT NULL as "has_raw_answer",
    (rf.response_data->>'full_grok_response') IS NOT NULL as "has_full_response",
    (rf.response_data->>'parsed_evaluation') IS NOT NULL as "has_parsed_eval",
    (rf.response_data->>'error_details') IS NOT NULL as "has_error_details",
    
    -- Raw Answer (Full)
    rf.response_data->>'raw_grok_answer' as "complete_raw_grok_answer",
    LENGTH(rf.response_data->>'raw_grok_answer') as "raw_answer_length",
    
    -- Full Grok Response (JSON)
    rf.response_data->'full_grok_response' as "full_grok_response_json",
    
    -- Parsed Evaluation (JSON)
    rf.response_data->'parsed_evaluation' as "parsed_evaluation_json",
    
    -- Error Details (JSON - contains extraction paths, structure analysis, etc.)
    rf.response_data->'error_details' as "error_details_json",
    
    -- Extraction Paths (from error_details)
    rf.response_data->'error_details'->'extractionPaths'->>'novelty' as "novelty_extraction_path",
    rf.response_data->'error_details'->'extractionPaths'->>'density' as "density_extraction_path",
    rf.response_data->'error_details'->'extractionPaths'->>'coherence' as "coherence_extraction_path",
    rf.response_data->'error_details'->'extractionPaths'->>'alignment' as "alignment_extraction_path",
    
    -- Evaluation Structure Analysis
    rf.response_data->'error_details'->'evaluationKeys' as "evaluation_keys",
    rf.response_data->'error_details'->'evaluationStructure' as "evaluation_structure",
    rf.response_data->'error_details'->'evaluationStructure'->>'hasScoring' as "has_scoring",
    rf.response_data->'error_details'->'evaluationStructure'->'scoringKeys' as "scoring_keys",
    
    -- Raw Values Before Extraction
    rf.response_data->'error_details'->>'noveltyRaw' as "novelty_raw",
    rf.response_data->'error_details'->>'densityRaw' as "density_raw",
    rf.response_data->'error_details'->>'coherenceRaw' as "coherence_raw",
    rf.response_data->'error_details'->>'alignmentRaw' as "alignment_raw",
    
    -- Extracted Scores (should all be 0 if this is a zero scores error)
    rf.response_data->'error_details'->>'baseNoveltyScore' as "base_novelty_score",
    rf.response_data->'error_details'->>'baseDensityScore' as "base_density_score",
    rf.response_data->'error_details'->>'coherenceScore' as "coherence_score",
    rf.response_data->'error_details'->>'alignmentScore' as "alignment_score",
    
    -- JSON Parsing Candidates
    rf.response_data->'error_details'->'jsonCandidates' as "json_candidates_tried",
    
    -- Contribution Metadata (if available)
    ci.metadata->>'evaluation_error' as "contribution_evaluation_error",
    ci.metadata->'error_details' as "contribution_error_details",
    ci.metadata->'full_grok_response' as "contribution_full_grok_response",
    ci.metadata->>'raw_grok_answer' as "contribution_raw_grok_answer",
    ci.metadata->'parsed_evaluation' as "contribution_parsed_evaluation",
    
    -- Summary Stats
    (SELECT COUNT(*) FROM poc_log WHERE event_type = 'evaluation_failed' AND created_at > NOW() - INTERVAL '7 days') as "total_failures_last_7_days",
    (SELECT COUNT(*) FROM poc_log WHERE event_type = 'evaluation_failed' AND response_data->>'raw_grok_answer' IS NOT NULL AND created_at > NOW() - INTERVAL '7 days') as "failures_with_raw_answer_last_7_days"
    
FROM recent_failure rf
LEFT JOIN contribution_info ci ON rf.submission_hash = ci.submission_hash;

