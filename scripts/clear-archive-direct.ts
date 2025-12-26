/**
 * Direct script to clear PoC archive using Supabase service role
 * This bypasses authentication by using the service role key
 * 
 * Run: npx tsx scripts/clear-archive-direct.ts
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'

const envLocal = resolve(process.cwd(), '.env.local')
const env = resolve(process.cwd(), '.env')
config({ path: envLocal })
config({ path: env })

import { createClient } from '@supabase/supabase-js'
import { db } from '../utils/db/db'
import { contributionsTable, allocationsTable, pocLogTable } from '../utils/db/schema'
import { sql } from 'drizzle-orm'

async function clearPoCArchive() {
    try {
        console.log('🗑️  Clearing PoC Archive...\n')
        console.log('⚠️  WARNING: This will delete ALL PoC submissions, allocations, and logs!\n')
        
        // Get counts before deletion
        const contributionsBefore = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(contributionsTable)
        
        const allocationsBefore = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(allocationsTable)
        
        const logsBefore = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(pocLogTable)
        
        console.log('Current counts:')
        console.log(`   Contributions: ${contributionsBefore[0]?.count || 0}`)
        console.log(`   Allocations: ${allocationsBefore[0]?.count || 0}`)
        console.log(`   Logs: ${logsBefore[0]?.count || 0}\n`)
        
        // Delete in order to respect foreign key constraints
        // 1. Delete allocations first (references contributions via submission_hash)
        console.log('1. Deleting allocations...')
        await db.delete(allocationsTable)
        console.log('   ✓ Allocations deleted')
        
        // 2. Delete poc_log entries (references contributions via submission_hash)
        console.log('2. Deleting PoC logs...')
        await db.delete(pocLogTable)
        console.log('   ✓ PoC logs deleted')
        
        // 3. Delete contributions
        console.log('3. Deleting contributions...')
        await db.delete(contributionsTable)
        console.log('   ✓ Contributions deleted')
        
        // Verify deletion
        const remainingContributions = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(contributionsTable)
        
        const remainingAllocations = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(allocationsTable)
        
        const remainingLogs = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(pocLogTable)
        
        console.log('\n✅ PoC Archive cleared successfully!')
        console.log(`   Remaining contributions: ${remainingContributions[0]?.count || 0}`)
        console.log(`   Remaining allocations: ${remainingAllocations[0]?.count || 0}`)
        console.log(`   Remaining logs: ${remainingLogs[0]?.count || 0}`)
        
        process.exit(0)
    } catch (error) {
        console.error('❌ Error clearing PoC archive:', error)
        if (error instanceof Error) {
            console.error('   Message:', error.message)
            if (error.stack) {
                console.error('   Stack:', error.stack)
            }
        }
        process.exit(1)
    }
}

clearPoCArchive()

