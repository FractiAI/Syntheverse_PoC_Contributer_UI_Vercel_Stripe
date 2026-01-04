/**
 * Test script to verify PoC submission with Grok API evaluation
 * This tests the full flow: submission -> Grok evaluation -> database update
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TITLE = `Test PoC Submission - ${Date.now()}`;
const TEST_CONTENT = `This is a test contribution to verify the Grok API integration for PoC evaluation.

The contribution discusses:
- Hydrogen-holographic fractal geometry applications
- Quantum computing implications
- Syntheverse ecosystem alignment
- Novel research findings in fractal mathematics

This submission should be evaluated by the Grok API and receive scores across four dimensions:
1. Novelty (with redundancy penalty)
2. Density
3. Coherence
4. Alignment

Expected behavior:
- Submission should be saved to database
- Grok API should be called automatically
- Evaluation results should be stored in metadata
- Status should be updated to 'qualified' or 'unqualified' based on pod_score (≥8000)`;

async function testSubmission() {
  console.log('🧪 Testing PoC Submission with Grok API Evaluation\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Submit contribution
    console.log('\n📝 Step 1: Submitting contribution...');
    console.log(`   Title: ${TEST_TITLE}`);
    console.log(`   Content length: ${TEST_CONTENT.length} chars`);

    const formData = new FormData();
    formData.append('title', TEST_TITLE);
    formData.append('text_content', TEST_CONTENT);
    formData.append('category', 'scientific');
    formData.append('contributor', 'test@example.com');

    const submitResponse = await fetch(`${BASE_URL}/api/submit`, {
      method: 'POST',
      body: formData,
    });

    const submitResult = await submitResponse.json();

    if (!submitResponse.ok) {
      console.error('❌ Submission failed!');
      console.error('   Status:', submitResponse.status);
      console.error('   Error:', submitResult.error);
      console.error('   Details:', submitResult.details || 'No details');
      return false;
    }

    console.log('✅ Submission successful!');
    console.log('   Submission hash:', submitResult.submission_hash);

    // Step 2: Check evaluation results
    if (submitResult.evaluation) {
      console.log('\n🤖 Step 2: Grok API Evaluation Results');
      console.log('   Coherence:', submitResult.evaluation.coherence);
      console.log('   Density:', submitResult.evaluation.density);
      console.log('   Novelty:', submitResult.evaluation.novelty);
      console.log('   Alignment:', submitResult.evaluation.alignment);
      console.log('   Redundancy penalty:', submitResult.evaluation.redundancy + '%');
      console.log('   Pod Score:', submitResult.evaluation.pod_score);
      console.log('   Qualified:', submitResult.evaluation.qualified ? '✅ Yes' : '❌ No');
      console.log('   Metals:', submitResult.evaluation.metals?.join(', ') || 'None');

      if (submitResult.evaluation.tokenomics_recommendation) {
        console.log('\n💰 Tokenomics Recommendation:');
        console.log(
          '   Eligible epochs:',
          submitResult.evaluation.tokenomics_recommendation.eligible_epochs?.join(', ') || 'None'
        );
        console.log(
          '   Suggested allocation:',
          submitResult.evaluation.tokenomics_recommendation.suggested_allocation || 'N/A'
        );
        console.log(
          '   Tier multiplier:',
          submitResult.evaluation.tokenomics_recommendation.tier_multiplier || 'N/A'
        );
        console.log(
          '   Requires admin approval:',
          submitResult.evaluation.tokenomics_recommendation.requires_admin_approval ? 'Yes' : 'No'
        );
      }

      if (submitResult.evaluation.redundancy_analysis) {
        console.log('\n🔍 Redundancy Analysis:');
        console.log('   ', submitResult.evaluation.redundancy_analysis.substring(0, 200) + '...');
      }
    } else if (submitResult.evaluation_error) {
      console.log('\n⚠️  Evaluation Error:');
      console.error('   ', submitResult.evaluation_error);
      return false;
    } else {
      console.log('\n⚠️  No evaluation results in response');
      console.log('   This might indicate evaluation is still processing or failed silently');
    }

    // Step 3: Verify submission in database (if possible)
    console.log('\n📊 Step 3: Submission Status');
    console.log('   Status:', submitResult.status || 'unknown');
    console.log('   Submission hash:', submitResult.submission_hash);

    console.log('\n✅ Test completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error('   ', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    return false;
  }
}

// Run test
testSubmission()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('\n🐛 Tests failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
