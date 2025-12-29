/**
 * API endpoint to fetch Financial Alignment PoC products from Stripe
 * 
 * GET /api/financial-alignment/products
 * 
 * Returns list of active Stripe products that are Financial Alignment contributions
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            )
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
            apiVersion: '2024-06-20'
        })

        // Fetch all active products
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price']
        })

        // Filter for Financial Alignment products
        // Products should have metadata.type === 'financial_alignment' or name contains "Contribution"
        const financialAlignmentProducts = products.data
            .filter(product => {
                const name = product.name.toLowerCase()
                const metadataType = product.metadata?.type?.toLowerCase()
                const hasContributionKeyword = name.includes('contribution')
                const isFinancialAlignment = metadataType === 'financial_alignment' || metadataType === 'financial_alignment_poc'
                
                return isFinancialAlignment || (hasContributionKeyword && (
                    name.includes('copper') || 
                    name.includes('silver') || 
                    name.includes('gold') ||
                    name.includes('$10,000') ||
                    name.includes('$25,000') ||
                    name.includes('$50,000') ||
                    name.includes('$100,000') ||
                    name.includes('$250,000')
                ))
            })
            .map(product => {
                const price = product.default_price as Stripe.Price | null
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description || '',
                    price_id: price?.id || null,
                    amount: price && typeof price.unit_amount === 'number' ? price.unit_amount / 100 : 0,
                    currency: price?.currency || 'usd',
                    metadata: product.metadata || {}
                }
            })
            .sort((a, b) => a.amount - b.amount) // Sort by amount ascending

        debug('FinancialAlignmentProducts', 'Fetched products', {
            count: financialAlignmentProducts.length,
            products: financialAlignmentProducts.map(p => ({ name: p.name, amount: p.amount }))
        })

        return NextResponse.json({
            products: financialAlignmentProducts
        })
    } catch (error) {
        debugError('FinancialAlignmentProducts', 'Error fetching products', error)
        return NextResponse.json(
            { error: 'Failed to fetch products', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

