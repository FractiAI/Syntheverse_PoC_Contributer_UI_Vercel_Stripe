/**
 * Admin API endpoint to clear all PoC archive data
 * DELETE /api/admin/clear-archive
 * 
 * WARNING: This will delete ALL PoC submissions, allocations, and logs!
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, pocLogTable } from '@/utils/db/schema'
import { sql } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { debug, debugError } from '@/utils/debug'

export async function DELETE(request: NextRequest) {
    debug('ClearArchive', 'Clearing all PoC archive data')
    
    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            debug('ClearArchive', 'Unauthorized clear attempt')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
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
        
        const countsBefore = {
            contributions: Number(contributionsBefore[0]?.count || 0),
            allocations: Number(allocationsBefore[0]?.count || 0),
            logs: Number(logsBefore[0]?.count || 0)
        }
        
        debug('ClearArchive', 'Counts before deletion', countsBefore)
        
        // Delete in order to respect foreign key constraints
        // 1. Delete allocations first (references contributions via submission_hash)
        await db.delete(allocationsTable)
        debug('ClearArchive', 'Allocations deleted')
        
        // 2. Delete poc_log entries (references contributions via submission_hash)
        await db.delete(pocLogTable)
        debug('ClearArchive', 'PoC logs deleted')
        
        // 3. Delete contributions
        await db.delete(contributionsTable)
        debug('ClearArchive', 'Contributions deleted')
        
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
        
        const countsAfter = {
            contributions: Number(remainingContributions[0]?.count || 0),
            allocations: Number(remainingAllocations[0]?.count || 0),
            logs: Number(remainingLogs[0]?.count || 0)
        }
        
        debug('ClearArchive', 'Archive cleared successfully', { countsBefore, countsAfter })
        
        return NextResponse.json({
            success: true,
            message: 'PoC archive cleared successfully',
            deleted: countsBefore,
            remaining: countsAfter
        })
    } catch (error) {
        debugError('ClearArchive', 'Error clearing archive', error)
        return NextResponse.json(
            { error: 'Failed to clear archive', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

