/**
 * API endpoint to get PoC registration status
 * 
 * GET /api/poc/[hash]/registration-status
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export async function GET(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    const submissionHash = params.hash
    debug('RegistrationStatus', 'Fetching registration status', { submissionHash })
    
    try {
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return NextResponse.json(
                {
                    submission_hash: submissionHash,
                    registered: false,
                    error: 'Contribution not found'
                },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        
        return NextResponse.json({
            submission_hash: submissionHash,
            registered: contrib.registered || false,
            registration_date: contrib.registration_date?.toISOString() || null,
            transaction_hash: contrib.registration_tx_hash || null,
            stripe_payment_id: contrib.stripe_payment_id || null
        })
    } catch (error) {
        debugError('RegistrationStatus', 'Error fetching registration status', error)
        return NextResponse.json(
            {
                submission_hash: submissionHash,
                registered: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

