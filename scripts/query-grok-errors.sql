-- ============================================
-- Query Grok API Error Details from Supabase
-- ============================================
-- Copy and paste these queries into Supabase SQL Editor
-- These queries help troubleshoot why scores are 0

-- ============================================
-- Query 1: Recent Evaluation Failures with Error Details
-- ============================================
-- Shows the most recent evaluation failures and what error information is stored
SELECT 
    'RECENT EVALUATION FAILURES' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.event_type,
    pl.event_status,
    pl.error_message,
    -- Check if detailed error info exists in response_data
    (pl.response_data->>'error') as "error",
    (pl.response_data->>'error_type') as "error_type",
    (pl.response_data->>'raw_grok_answer') IS NOT NULL as "has_raw_answer",
    LENGTH(pl.response_data->>'raw_grok_answer') as "raw_answer_length",
    (pl.response_data->>'full_grok_response') IS NOT NULL as "has_full_response",
    (pl.response_data->>'parsed_evaluation') IS NOT NULL as "has_parsed_eval",
    (pl.response_data->>'error_details') IS NOT NULL as "has_error_details"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
ORDER BY pl.created_at DESC
LIMIT 10;

-- ============================================
-- Query 2: Get Full Error Details for Most Recent Failure
-- ============================================
-- Shows complete error information including raw Grok response
SELECT 
    'FULL ERROR DETAILS - MOST RECENT' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.error_message,
    pl.response_data->>'error' as "error",
    pl.response_data->>'error_type' as "error_type",
    -- Raw Grok answer (first 2000 chars)
    SUBSTRING(pl.response_data->>'raw_grok_answer', 1, 2000) as "raw_grok_answer_preview",
    LENGTH(pl.response_data->>'raw_grok_answer') as "raw_answer_full_length",
    -- Full Grok response (first 2000 chars)
    SUBSTRING(pl.response_data->>'full_grok_response'::text, 1, 2000) as "full_grok_response_preview",
    -- Parsed evaluation (first 2000 chars)
    SUBSTRING(pl.response_data->>'parsed_evaluation'::text, 1, 2000) as "parsed_evaluation_preview",
    -- Error details (first 2000 chars)
    SUBSTRING(pl.response_data->>'error_details'::text, 1, 2000) as "error_details_preview"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 1;

-- ============================================
-- Query 3: Get Complete Raw Grok Answer
-- ============================================
-- Shows the full raw text that Grok returned (for most recent failure)
SELECT 
    'COMPLETE RAW GROK ANSWER' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.response_data->>'raw_grok_answer' as "complete_raw_grok_answer"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data->>'raw_grok_answer' IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 1;

-- ============================================
-- Query 4: Get Full Grok API Response Structure
-- ============================================
-- Shows the complete Grok API response JSON structure
SELECT 
    'FULL GROK API RESPONSE STRUCTURE' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.response_data->'full_grok_response' as "full_grok_response_json"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data->'full_grok_response' IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 1;

-- ============================================
-- Query 5: Get Parsed Evaluation Object
-- ============================================
-- Shows what our parser extracted from Grok's response
SELECT 
    'PARSED EVALUATION OBJECT' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.response_data->'parsed_evaluation' as "parsed_evaluation_json"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data->'parsed_evaluation' IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 1;

-- ============================================
-- Query 6: Get Complete Error Details Object
-- ============================================
-- Shows all the debugging information we captured
SELECT 
    'COMPLETE ERROR DETAILS' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.response_data->'error_details' as "error_details_json"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data->'error_details' IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 1;

-- ============================================
-- Query 7: Check Contributions Metadata for Error Details
-- ============================================
-- Shows error information stored in contributions table metadata
SELECT 
    'CONTRIBUTIONS METADATA - ERROR DETAILS' as "Query",
    c.submission_hash,
    c.title,
    c.status,
    c.created_at,
    c.metadata->>'evaluation_error' as "evaluation_error",
    c.metadata->>'evaluation_failed_at' as "evaluation_failed_at",
    c.metadata->>'evaluation_error_type' as "evaluation_error_type",
    (c.metadata->>'error_details') IS NOT NULL as "has_error_details",
    (c.metadata->>'full_grok_response') IS NOT NULL as "has_full_grok_response",
    (c.metadata->>'raw_grok_answer') IS NOT NULL as "has_raw_grok_answer",
    (c.metadata->>'parsed_evaluation') IS NOT NULL as "has_parsed_evaluation",
    -- Preview of raw answer (first 500 chars)
    SUBSTRING(c.metadata->>'raw_grok_answer', 1, 500) as "raw_grok_answer_preview"
FROM contributions c
WHERE c.status = 'evaluation_failed'
ORDER BY c.created_at DESC
LIMIT 10;

-- ============================================
-- Query 8: Get Complete Error Info from Contributions (Most Recent)
-- ============================================
-- Shows all error details from contributions metadata
SELECT 
    'COMPLETE CONTRIBUTION ERROR INFO' as "Query",
    c.submission_hash,
    c.title,
    c.status,
    c.created_at,
    c.metadata->'error_details' as "error_details",
    c.metadata->'full_grok_response' as "full_grok_response",
    c.metadata->>'raw_grok_answer' as "raw_grok_answer",
    c.metadata->'parsed_evaluation' as "parsed_evaluation"
FROM contributions c
WHERE c.status = 'evaluation_failed'
    AND (
        c.metadata->'error_details' IS NOT NULL
        OR c.metadata->'full_grok_response' IS NOT NULL
        OR c.metadata->>'raw_grok_answer' IS NOT NULL
    )
ORDER BY c.created_at DESC
LIMIT 1;

-- ============================================
-- Query 9: Summary - What Error Info We Have
-- ============================================
-- Quick summary of what error information is available
SELECT 
    'SUMMARY - ERROR INFO AVAILABILITY' as "Query",
    COUNT(*) FILTER (WHERE pl.event_type = 'evaluation_failed') as "total_failures",
    COUNT(*) FILTER (WHERE pl.event_type = 'evaluation_failed' AND pl.response_data IS NOT NULL) as "failures_with_response_data",
    COUNT(*) FILTER (WHERE pl.event_type = 'evaluation_failed' AND pl.response_data->>'raw_grok_answer' IS NOT NULL) as "failures_with_raw_answer",
    COUNT(*) FILTER (WHERE pl.event_type = 'evaluation_failed' AND pl.response_data->>'full_grok_response' IS NOT NULL) as "failures_with_full_response",
    COUNT(*) FILTER (WHERE pl.event_type = 'evaluation_failed' AND pl.response_data->>'parsed_evaluation' IS NOT NULL) as "failures_with_parsed_eval",
    COUNT(*) FILTER (WHERE pl.event_type = 'evaluation_failed' AND pl.response_data->>'error_details' IS NOT NULL) as "failures_with_error_details"
FROM poc_log pl
WHERE pl.created_at > NOW() - INTERVAL '7 days';

-- ============================================
-- Query 10: Get Extraction Paths from Error Details
-- ============================================
-- Shows which extraction paths were used (or attempted) for each score
SELECT 
    'EXTRACTION PATHS' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.response_data->'error_details'->'extractionPaths'->>'novelty' as "novelty_path",
    pl.response_data->'error_details'->'extractionPaths'->>'density' as "density_path",
    pl.response_data->'error_details'->'extractionPaths'->>'coherence' as "coherence_path",
    pl.response_data->'error_details'->'extractionPaths'->>'alignment' as "alignment_path",
    pl.response_data->'error_details'->'evaluationStructure'->>'hasScoring' as "has_scoring",
    pl.response_data->'error_details'->'evaluationStructure'->'scoringKeys' as "scoring_keys"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data->'error_details'->'extractionPaths' IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 5;

-- ============================================
-- Query 11: Get Evaluation Structure Analysis
-- ============================================
-- Shows what structure Grok returned and what we found
SELECT 
    'EVALUATION STRUCTURE ANALYSIS' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.response_data->'error_details'->'evaluationKeys' as "evaluation_keys",
    pl.response_data->'error_details'->'evaluationStructure' as "evaluation_structure",
    pl.response_data->'error_details'->'scoringString' as "scoring_string"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data->'error_details'->'evaluationStructure' IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 1;

-- ============================================
-- Query 12: Get JSON Parsing Candidates
-- ============================================
-- Shows what JSON parsing candidates were tried
SELECT 
    'JSON PARSING CANDIDATES' as "Query",
    pl.submission_hash,
    pl.title,
    pl.created_at,
    pl.response_data->'error_details'->'jsonCandidates' as "json_candidates_tried"
FROM poc_log pl
WHERE pl.event_type = 'evaluation_failed'
    AND pl.response_data->'error_details'->'jsonCandidates' IS NOT NULL
ORDER BY pl.created_at DESC
LIMIT 1;

