/**
 * Clear PoC archive using Supabase REST API with service role key
 * This uses the Supabase PostgREST API to execute DELETE operations
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

const envLocal = resolve(process.cwd(), '.env.local');
const env = resolve(process.cwd(), '.env');
config({ path: envLocal });
config({ path: env });

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jfbgdxeumzqzigptbmvp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4NzM4OCwiZXhwIjoyMDgxNjYzMzg4fQ.-2HxO5TMcWFv21Ax4GZMqjTuJz-okIujHQx-R2xrTnY';

async function clearPoCArchive() {
  try {
    console.log('🗑️  Clearing PoC Archive via Supabase API...\n');
    console.log('⚠️  WARNING: This will delete ALL PoC submissions, allocations, and logs!\n');

    const headers = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    // Get counts before deletion
    console.log('Getting current counts...');
    const [contributionsRes, allocationsRes, logsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/contributions?select=submission_hash`, {
        method: 'GET',
        headers: { ...headers, Range: '0-0' },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/allocations?select=id`, {
        method: 'GET',
        headers: { ...headers, Range: '0-0' },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/poc_log?select=id`, {
        method: 'GET',
        headers: { ...headers, Range: '0-0' },
      }),
    ]);

    const contributionsCount = contributionsRes.headers.get('content-range')?.split('/')[1] || '0';
    const allocationsCount = allocationsRes.headers.get('content-range')?.split('/')[1] || '0';
    const logsCount = logsRes.headers.get('content-range')?.split('/')[1] || '0';

    console.log('Current counts:');
    console.log(`   Contributions: ${contributionsCount}`);
    console.log(`   Allocations: ${allocationsCount}`);
    console.log(`   Logs: ${logsCount}\n`);

    // Delete in order to respect foreign key constraints
    // 1. Delete allocations first
    console.log('1. Deleting allocations...');
    const deleteAllocations = await fetch(`${SUPABASE_URL}/rest/v1/allocations`, {
      method: 'DELETE',
      headers: headers,
    });
    if (!deleteAllocations.ok) {
      const error = await deleteAllocations.text();
      console.error(`   ❌ Failed to delete allocations: ${deleteAllocations.status} ${error}`);
    } else {
      console.log('   ✓ Allocations deleted');
    }

    // 2. Delete poc_log entries
    console.log('2. Deleting PoC logs...');
    const deleteLogs = await fetch(`${SUPABASE_URL}/rest/v1/poc_log`, {
      method: 'DELETE',
      headers: headers,
    });
    if (!deleteLogs.ok) {
      const error = await deleteLogs.text();
      console.error(`   ❌ Failed to delete logs: ${deleteLogs.status} ${error}`);
    } else {
      console.log('   ✓ PoC logs deleted');
    }

    // 3. Delete contributions
    console.log('3. Deleting contributions...');
    const deleteContributions = await fetch(`${SUPABASE_URL}/rest/v1/contributions`, {
      method: 'DELETE',
      headers: headers,
    });
    if (!deleteContributions.ok) {
      const error = await deleteContributions.text();
      console.error(`   ❌ Failed to delete contributions: ${deleteContributions.status} ${error}`);
    } else {
      console.log('   ✓ Contributions deleted');
    }

    // Verify deletion
    console.log('\nVerifying deletion...');
    const [contributionsAfterRes, allocationsAfterRes, logsAfterRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/contributions?select=submission_hash`, {
        method: 'GET',
        headers: { ...headers, Range: '0-0' },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/allocations?select=id`, {
        method: 'GET',
        headers: { ...headers, Range: '0-0' },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/poc_log?select=id`, {
        method: 'GET',
        headers: { ...headers, Range: '0-0' },
      }),
    ]);

    const contributionsAfter =
      contributionsAfterRes.headers.get('content-range')?.split('/')[1] || '0';
    const allocationsAfter = allocationsAfterRes.headers.get('content-range')?.split('/')[1] || '0';
    const logsAfter = logsAfterRes.headers.get('content-range')?.split('/')[1] || '0';

    console.log('\n✅ PoC Archive cleared successfully!');
    console.log(`   Remaining contributions: ${contributionsAfter}`);
    console.log(`   Remaining allocations: ${allocationsAfter}`);
    console.log(`   Remaining logs: ${logsAfter}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing PoC archive:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
    }
    process.exit(1);
  }
}

clearPoCArchive();
