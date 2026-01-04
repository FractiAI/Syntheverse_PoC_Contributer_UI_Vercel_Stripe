#!/usr/bin/env node
/**
 * Analyze Grok API responses from evaluation failures
 * This script queries the database to see what Grok is actually returning
 */

require('dotenv').config({ path: '.env.local' });
const { db } = require('../utils/db/db');
const { pocLogTable, contributionsTable } = require('../utils/db/schema');
const { eq, desc, or } = require('drizzle-orm');

async function analyzeGrokResponses() {
  console.log('🔍 Analyzing Grok API responses from recent evaluation failures...\n');

  try {
    // Get recent evaluation_failed events
    const failedLogs = await db
      .select()
      .from(pocLogTable)
      .where(eq(pocLogTable.event_type, 'evaluation_failed'))
      .orderBy(desc(pocLogTable.created_at))
      .limit(5);

    console.log(`Found ${failedLogs.length} recent evaluation failures\n`);

    for (const log of failedLogs) {
      console.log('='.repeat(80));
      console.log(`Submission: ${log.submission_hash}`);
      console.log(`Title: ${log.title || 'N/A'}`);
      console.log(`Created: ${log.created_at}`);
      console.log(`Error: ${log.error_message || 'N/A'}\n`);

      // Check response_data for detailed error info
      if (log.response_data) {
        const responseData = log.response_data;
        console.log('📋 Response Data:');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('\n');

        // Check for raw Grok answer
        if (responseData.raw_grok_answer) {
          console.log('📝 Raw Grok Answer:');
          console.log(responseData.raw_grok_answer.substring(0, 1000));
          if (responseData.raw_grok_answer.length > 1000) {
            console.log(`\n... (truncated, total length: ${responseData.raw_grok_answer.length})`);
          }
          console.log('\n');
        }

        // Check for full Grok response
        if (responseData.full_grok_response) {
          console.log('🔧 Full Grok API Response:');
          console.log(JSON.stringify(responseData.full_grok_response, null, 2));
          console.log('\n');
        }

        // Check for parsed evaluation
        if (responseData.parsed_evaluation) {
          console.log('📊 Parsed Evaluation Object:');
          console.log(JSON.stringify(responseData.parsed_evaluation, null, 2));
          console.log('\n');
        }

        // Check for error details
        if (responseData.error_details) {
          console.log('⚠️  Error Details:');
          console.log(JSON.stringify(responseData.error_details, null, 2));
          console.log('\n');
        }
      }

      // Check grok_api_response
      if (log.grok_api_response) {
        console.log('🌐 Grok API Response (from log):');
        console.log(JSON.stringify(log.grok_api_response, null, 2));
        console.log('\n');
      }

      // Also check contributions table metadata
      const contribution = await db
        .select()
        .from(contributionsTable)
        .where(eq(contributionsTable.submission_hash, log.submission_hash))
        .limit(1);

      if (contribution.length > 0 && contribution[0].metadata) {
        const metadata = contribution[0].metadata;
        if (metadata.error_details || metadata.full_grok_response || metadata.raw_grok_answer) {
          console.log('💾 Contribution Metadata:');
          if (metadata.error_details) {
            console.log('Error Details:', JSON.stringify(metadata.error_details, null, 2));
          }
          if (metadata.full_grok_response) {
            console.log(
              'Full Grok Response:',
              JSON.stringify(metadata.full_grok_response, null, 2)
            );
          }
          if (metadata.raw_grok_answer) {
            console.log(
              'Raw Grok Answer (first 500 chars):',
              metadata.raw_grok_answer.substring(0, 500)
            );
          }
          console.log('\n');
        }
      }

      console.log('\n');
    }

    // Summary
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`Total evaluation failures analyzed: ${failedLogs.length}`);

    const withRawAnswer = failedLogs.filter(
      (log) => log.response_data?.raw_grok_answer || log.response_data?.full_grok_response
    ).length;

    console.log(`Logs with Grok response data: ${withRawAnswer}`);
  } catch (error) {
    console.error('❌ Error analyzing Grok responses:', error);
    process.exit(1);
  }
}

// Run the analysis
analyzeGrokResponses()
  .then(() => {
    console.log('✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
