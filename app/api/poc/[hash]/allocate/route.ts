/**
 * API endpoint to allocate SYNTH tokens for a PoC
 * 
 * POST /api/poc/[hash]/allocate
 * 
 * Allocates tokens if PoC is qualified and not yet allocated
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, epochBalancesTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { calculateProjectedAllocation } from '@/utils/tokenomics/projected-allocation'
import { calculateMetalAmplification } from '@/utils/tokenomics/metal-amplification'
import { isQualifiedForOpenEpoch } from '@/utils/epochs/qualification'
import { debug, debugError } from '@/utils/debug'
import crypto from 'crypto'

export async function POST(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    const submissionHash = params.hash
    debug('AllocateTokens', 'Allocating tokens for PoC', { submissionHash })
    
    try {
        // Verify user is authenticated
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        // Get contribution
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        
        // Verify user is the contributor
        if (contrib.contributor !== user.email) {
            return NextResponse.json(
                { error: 'Forbidden: You can only allocate tokens for your own PoCs' },
                { status: 403 }
            )
        }
        
        // Check if already allocated
        const existingAllocations = await db
            .select()
            .from(allocationsTable)
            .where(eq(allocationsTable.submission_hash, submissionHash))
        
        if (existingAllocations.length > 0) {
            return NextResponse.json(
                { error: 'Tokens already allocated for this PoC' },
                { status: 400 }
            )
        }
        
        // Calculate projected allocation
        const projectedAlloc = await calculateProjectedAllocation(submissionHash)
        
        if (!projectedAlloc.eligible || projectedAlloc.projected_allocation === 0) {
            return NextResponse.json(
                { error: 'PoC is not eligible for token allocation' },
                { status: 400 }
            )
        }
        
        // Get metadata
        const metadata = contrib.metadata as any || {}
        const metals = (contrib.metals as string[]) || []
        
        // Get epoch balance
        const epochBalances = await db
            .select()
            .from(epochBalancesTable)
            .where(eq(epochBalancesTable.epoch, projectedAlloc.epoch))
            .limit(1)
        
        if (!epochBalances || epochBalances.length === 0) {
            return NextResponse.json(
                { error: `Epoch ${projectedAlloc.epoch} not found` },
                { status: 404 }
            )
        }
        
        const epochBalance = epochBalances[0]
        const currentBalance = Number(epochBalance.balance)
        
        // Verify enough balance
        if (currentBalance < projectedAlloc.projected_allocation) {
            return NextResponse.json(
                { error: 'Insufficient epoch balance for allocation' },
                { status: 400 }
            )
        }
        
        // Create allocation record for each metal
        const allocationId = crypto.randomUUID()
        const newBalance = currentBalance - projectedAlloc.projected_allocation
        
        // Use first metal or default
        const primaryMetal = metals[0] || 'copper'
        
        await db.insert(allocationsTable).values({
            id: allocationId,
            submission_hash: submissionHash,
            contributor: contrib.contributor,
            metal: primaryMetal,
            epoch: projectedAlloc.epoch,
            tier: null, // Can be enhanced later
            reward: projectedAlloc.projected_allocation.toString(),
            tier_multiplier: projectedAlloc.breakdown.tier_multiplier.toString(),
            epoch_balance_before: currentBalance.toString(),
            epoch_balance_after: newBalance.toString(),
        })
        
        // Update epoch balance
        await db
            .update(epochBalancesTable)
            .set({
                balance: newBalance.toString(),
                updated_at: new Date()
            })
            .where(eq(epochBalancesTable.epoch, projectedAlloc.epoch))
        
        debug('AllocateTokens', 'Tokens allocated successfully', {
            submissionHash,
            allocationId,
            amount: projectedAlloc.projected_allocation,
            epoch: projectedAlloc.epoch
        })
        
        return NextResponse.json({
            success: true,
            allocation_id: allocationId,
            amount: projectedAlloc.projected_allocation,
            epoch: projectedAlloc.epoch,
            breakdown: projectedAlloc.breakdown
        })
    } catch (error) {
        debugError('AllocateTokens', 'Error allocating tokens', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

