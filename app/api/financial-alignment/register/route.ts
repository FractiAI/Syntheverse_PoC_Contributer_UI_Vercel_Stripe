/**
 * API endpoint to initiate Financial Alignment PoC registration via Stripe checkout
 * 
 * POST /api/financial-alignment/register
 * 
 * Body: { product_id: string, price_id: string, amount: number }
 * 
 * Creates a Stripe checkout session for the selected Financial Alignment contribution level
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

        // Parse request body
        const body = await request.json()
        const { product_id, price_id, amount } = body

        if (!product_id || !price_id || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: product_id, price_id, and amount are required' },
                { status: 400 }
            )
        }

        // Get Stripe instance
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            )
        }

        const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '')
        const stripe = new Stripe(sanitizedKey, {
            apiVersion: '2024-06-20'
        })

        // Get base URL
        let baseUrl: string | undefined = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL)?.trim()
        
        if (!baseUrl) {
            const host = request.headers.get('host')
            const protocol = request.headers.get('x-forwarded-proto') || 'https'
            if (host) {
                baseUrl = `${protocol}://${host}`
            }
        }
        
        if (!baseUrl) {
            baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined
        }
        
        if (!baseUrl || !baseUrl.match(/^https?:\/\//)) {
            return NextResponse.json(
                { error: 'Configuration error: Site URL not configured' },
                { status: 500 }
            )
        }

        // Fetch product details from Stripe to get name
        let productName = 'Financial Alignment PoC'
        let productDescription = ''
        try {
            const product = await stripe.products.retrieve(product_id)
            productName = product.name
            productDescription = product.description || ''
        } catch (err) {
            debugError('FinancialAlignmentRegister', 'Failed to fetch product details', err)
        }

        // ERC-20 Alignment Language for checkout description
        const erc20AlignmentDescription = `ERC-20 Financial Alignment Contribution: ${productName}

IMPORTANT ERC-20 ALIGNMENT TERMS:
• ALIGNMENT PURPOSE ONLY: ERC-20 tokens (SYNTH) are for alignment with the Syntheverse ecosystem only
• NOT FOR OWNERSHIP: Tokens do NOT represent equity, ownership, or financial interest
• NO EXTERNAL TRADING: Tokens are NON-TRANSFERABLE and NON-TRADEABLE on external exchanges
• ECOSYSTEM UTILITY ONLY: Tokens function exclusively within Syntheverse for participation and alignment tracking

By proceeding, you acknowledge these ERC-20 tokens are for alignment purposes only, do not represent ownership, and cannot be traded externally.`

        // Create Stripe checkout session using the price_id
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price_id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/dashboard?financial_alignment=success&product_id=${product_id}`,
            cancel_url: `${baseUrl}/dashboard?financial_alignment=cancelled`,
            metadata: {
                contributor: user.email!,
                type: 'financial_alignment_poc',
                product_id: product_id,
                product_name: productName,
                amount: amount.toString(),
                erc20_alignment_only: 'true',
                no_ownership: 'true',
                no_external_trading: 'true',
            },
            // Add custom description to payment intent metadata
            payment_intent_data: {
                description: erc20AlignmentDescription.substring(0, 500), // Stripe has 500 char limit
                metadata: {
                    erc20_alignment_only: 'true',
                    no_ownership: 'true',
                    no_external_trading: 'true',
                    alignment_purpose: 'Syntheverse ecosystem alignment only',
                }
            }
        })

        debug('FinancialAlignmentRegister', 'Checkout session created', {
            sessionId: session.id,
            productId: product_id,
            amount
        })

        if (!session.url) {
            return NextResponse.json(
                { error: 'Failed to get checkout URL from Stripe session' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            checkout_url: session.url,
            session_id: session.id
        })
    } catch (error) {
        debugError('FinancialAlignmentRegister', 'Error creating checkout session', error)
        return NextResponse.json(
            { 
                error: 'Registration failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

