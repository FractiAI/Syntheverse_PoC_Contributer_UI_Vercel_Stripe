/**
 * API endpoint to initiate PoC registration via Stripe checkout
 * 
 * POST /api/poc/[hash]/register
 * 
 * Creates a Stripe checkout session for an operator-configured, fee-based on-chain anchoring service.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

// Force dynamic rendering - this route must be server-side only
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    // Extract hash from params outside try block for error handling
    if (!params) {
        debugError('RegisterPoC', 'Params object is missing', {})
        return NextResponse.json(
            { error: 'Invalid request: missing parameters' },
            { status: 400 }
        )
    }
    
    const submissionHash = params?.hash || 'unknown'
    
    try {
        if (!submissionHash || submissionHash === 'unknown') {
            debugError('RegisterPoC', 'Missing submission hash in params', { params })
            return NextResponse.json(
                { error: 'Missing submission hash' },
                { status: 400 }
            )
        }
        
        debug('RegisterPoC', 'Initiating PoC registration', { submissionHash })
        
        // Verify user is authenticated
        let supabase
        try {
            supabase = createClient()
        } catch (supabaseError) {
            debugError('RegisterPoC', 'Failed to create Supabase client', supabaseError)
            return NextResponse.json(
                { 
                    error: 'Authentication service error',
                    message: supabaseError instanceof Error ? supabaseError.message : 'Failed to initialize authentication'
                },
                { status: 500 }
            )
        }
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            debugError('RegisterPoC', 'Authentication failed', { 
                authError: authError?.message,
                hasUser: !!user 
            })
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        // Get contribution
        let contributions
        try {
            contributions = await db
                .select()
                .from(contributionsTable)
                .where(eq(contributionsTable.submission_hash, submissionHash))
                .limit(1)
        } catch (dbError) {
            debugError('RegisterPoC', 'Database query error', dbError)
            return NextResponse.json(
                { 
                    error: 'Database error',
                    message: dbError instanceof Error ? dbError.message : 'Unknown database error'
                },
                { status: 500 }
            )
        }
        
        if (!contributions || contributions.length === 0) {
            debugError('RegisterPoC', 'Contribution not found', { submissionHash })
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        
        // Verify user is the contributor
        if (contrib.contributor !== user.email) {
            debugError('RegisterPoC', 'User is not the contributor', {
                contributor: contrib.contributor,
                userEmail: user.email
            })
            return NextResponse.json(
                { error: 'Forbidden: You can only register your own PoCs' },
                { status: 403 }
            )
        }
        
        // Check if already registered
        if (contrib.registered) {
            debug('RegisterPoC', 'PoC already registered', { submissionHash })
            return NextResponse.json(
                { error: 'PoC is already registered' },
                { status: 400 }
            )
        }

        // Enforce: only qualified PoCs can be anchored/registered
        if (contrib.status !== 'qualified') {
            debugError('RegisterPoC', 'PoC is not qualified for on-chain anchoring', {
                submissionHash,
                status: contrib.status,
            })
            return NextResponse.json(
                { error: 'PoC is not qualified for on-chain anchoring' },
                { status: 400 }
            )
        }

        // Registration is now free - directly register the PoC on blockchain
        debug('RegisterPoC', 'Initiating free PoC registration (no payment required)', {
            submissionHash
        })

        const metadata = contrib.metadata as any || {}
        const metals = (contrib.metals as string[]) || []
        
        // Register PoC on Hard Hat L1 blockchain
        let blockchainTxHash: string | null = null
        try {
            const { registerPoCOnBlockchain } = await import('@/utils/blockchain/register-poc')
            const blockchainResult = await registerPoCOnBlockchain(
                submissionHash,
                contrib.contributor,
                {
                    novelty: metadata.novelty,
                    density: metadata.density,
                    coherence: metadata.coherence,
                    alignment: metadata.alignment,
                    pod_score: metadata.pod_score
                },
                metals,
                contrib.text_content || null
            )
            
            if (blockchainResult.success && blockchainResult.transaction_hash) {
                blockchainTxHash = blockchainResult.transaction_hash
                debug('RegisterPoC', 'PoC registered on Hard Hat L1 blockchain', {
                    submissionHash,
                    txHash: blockchainTxHash,
                    blockNumber: blockchainResult.block_number
                })
            } else {
                debugError('RegisterPoC', 'Blockchain registration failed', {
                    submissionHash,
                    error: blockchainResult.error
                })
                return NextResponse.json(
                    { 
                        error: 'Blockchain registration failed',
                        message: blockchainResult.error || 'Failed to register PoC on blockchain'
                    },
                    { status: 500 }
                )
            }
        } catch (blockchainError) {
            debugError('RegisterPoC', 'Blockchain registration error', blockchainError)
            return NextResponse.json(
                { 
                    error: 'Blockchain registration error',
                    message: blockchainError instanceof Error ? blockchainError.message : 'Unknown error during blockchain registration'
                },
                { status: 500 }
            )
        }
        
        // Update contribution with registration info
        try {
            await db
                .update(contributionsTable)
                .set({
                    registered: true,
                    status: 'registered',
                    registration_date: new Date(),
                    registration_tx_hash: blockchainTxHash,
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
            
            debug('RegisterPoC', 'PoC registration completed successfully', {
                submissionHash,
                txHash: blockchainTxHash
            })
        } catch (updateError) {
            debugError('RegisterPoC', 'Failed to update contribution after registration', updateError)
            // Still return success since blockchain registration succeeded
        }
        
        return NextResponse.json({
            success: true,
            registered: true,
            registration_tx_hash: blockchainTxHash,
            message: 'PoC registered successfully on blockchain'
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorName = error instanceof Error ? error.name : 'Error'
        
        debugError('RegisterPoC', 'Unexpected error in registration endpoint', {
            error,
            errorName,
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            submissionHash
        })
        
        // Return detailed error for debugging (always include message, stack only in dev)
        const errorResponse: any = {
            error: 'Registration failed',
            message: errorMessage,
            error_type: errorName,
            submission_hash: submissionHash
        }
        
        if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
            errorResponse.stack = error.stack.substring(0, 1000)
        }
        
        return NextResponse.json(errorResponse, { status: 500 })
    }
}

