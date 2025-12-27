/**
 * API endpoint to clear the PoC archive and reset registration/payment history
 * 
 * DELETE /api/admin/clear-archive
 * 
 * This endpoint clears:
 * - All contributions
 * - All allocations
 * - All poc_log entries
 * - Resets tokenomics total_distributed to 0
 * - Resets epoch balances (preserves epoch structure, just resets distributed amounts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, pocLogTable, tokenomicsTable, epochBalancesTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(request: NextRequest) {
    debug('ClearArchive', 'Archive cleanup requested')
    
    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            debug('ClearArchive', 'Unauthorized cleanup attempt')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Start transaction-like operation (delete in correct order to respect foreign keys)
        let contributionsDeleted = 0
        let allocationsDeleted = 0
        let logsDeleted = 0
        
        try {
            // 1. Delete all allocations first
            const allocations = await db
                .select()
                .from(allocationsTable)
            
            for (const allocation of allocations) {
                await db
                    .delete(allocationsTable)
                    .where(eq(allocationsTable.id, allocation.id))
            }
            allocationsDeleted = allocations.length
            debug('ClearArchive', 'Deleted allocations', { count: allocationsDeleted })
            
            // 2. Delete all poc_log entries
            const logs = await db
                .select()
                .from(pocLogTable)
            
            for (const log of logs) {
                await db
                    .delete(pocLogTable)
                    .where(eq(pocLogTable.id, log.id))
            }
            logsDeleted = logs.length
            debug('ClearArchive', 'Deleted logs', { count: logsDeleted })
            
            // 3. Delete all contributions (this will also clear registration data)
            const contributions = await db
                .select()
                .from(contributionsTable)
            
            for (const contribution of contributions) {
                await db
                    .delete(contributionsTable)
                    .where(eq(contributionsTable.submission_hash, contribution.submission_hash))
            }
            contributionsDeleted = contributions.length
            debug('ClearArchive', 'Deleted contributions', { count: contributionsDeleted })
            
            // 4. Reset tokenomics total_distributed to 0
            const tokenomicsState = await db
                .select()
                .from(tokenomicsTable)
                .where(eq(tokenomicsTable.id, 'main'))
                .limit(1)
            
            if (tokenomicsState.length > 0) {
                await db
                    .update(tokenomicsTable)
                    .set({
                        total_distributed: '0',
                        updated_at: new Date()
                    })
                    .where(eq(tokenomicsTable.id, 'main'))
                debug('ClearArchive', 'Reset tokenomics total_distributed to 0')
            }
            
            // 5. Reset epoch balances to original distribution amounts
            // This preserves the epoch structure but resets distributed amounts
            const epochBalances = await db
                .select()
                .from(epochBalancesTable)
            
            for (const epochBalance of epochBalances) {
                // Reset balance to distribution_amount (original allocation)
                await db
                    .update(epochBalancesTable)
                    .set({
                        balance: epochBalance.distribution_amount.toString(),
                        updated_at: new Date()
                    })
                    .where(eq(epochBalancesTable.id, epochBalance.id))
            }
            debug('ClearArchive', 'Reset epoch balances', { count: epochBalances.length })
            
            debug('ClearArchive', 'Archive cleanup completed successfully', {
                contributionsDeleted,
                allocationsDeleted,
                logsDeleted
            })
            
            return NextResponse.json({
                success: true,
                message: 'Archive cleared successfully',
                deleted: {
                    contributions: contributionsDeleted,
                    allocations: allocationsDeleted,
                    logs: logsDeleted
                },
                reset: {
                    tokenomics_total_distributed: 0,
                    epoch_balances: epochBalances.length
                }
            })
        } catch (deleteError) {
            debugError('ClearArchive', 'Error during cleanup', deleteError)
            throw deleteError
        }
    } catch (error) {
        debugError('ClearArchive', 'Archive cleanup failed', error)
        return NextResponse.json(
            { 
                error: 'Failed to clear archive',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
