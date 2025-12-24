#!/usr/bin/env node
/**
 * Backfill script to vectorize all existing submissions that don't have vectors
 * 
 * This script:
 * 1. Fetches all submissions without vectors
 * 2. Generates embeddings and 3D coordinates for each
 * 3. Updates the database with vector data
 */

const BASE_URL = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://syntheverse-poc.vercel.app'

async function backfillVectors() {
    console.log('🔄 Starting vector backfill for existing submissions\n')
    console.log(`Base URL: ${BASE_URL}\n`)

    try {
        // Step 1: Get all submissions
        console.log('📊 Step 1: Fetching all submissions...')
        const contributionsResponse = await fetch(`${BASE_URL}/api/archive/contributions`)
        
        if (!contributionsResponse.ok) {
            throw new Error(`Failed to fetch contributions: ${contributionsResponse.status}`)
        }
        
        const contributions = await contributionsResponse.json()
        console.log(`   Found ${contributions.length} total submissions\n`)

        // Step 2: Filter submissions without vectors
        const withoutVectors = contributions.filter(c => 
            !c.vector_x || !c.vector_y || !c.vector_z
        )
        
        console.log(`📊 Step 2: Identifying submissions without vectors...`)
        console.log(`   Submissions without vectors: ${withoutVectors.length}`)
        console.log(`   Already vectorized: ${contributions.length - withoutVectors.length}\n`)

        if (withoutVectors.length === 0) {
            console.log('✅ All submissions are already vectorized!')
            return
        }

        // Step 3: Vectorize each submission
        console.log(`🔄 Step 3: Vectorizing ${withoutVectors.length} submissions...\n`)
        
        let successCount = 0
        let errorCount = 0

        for (let i = 0; i < withoutVectors.length; i++) {
            const contrib = withoutVectors[i]
            console.log(`[${i + 1}/${withoutVectors.length}] Processing: "${contrib.title}"`)
            
            try {
                // Trigger evaluation/re-vectorization by calling the evaluate endpoint
                // This will generate vectors if they don't exist
                const evaluateResponse = await fetch(
                    `${BASE_URL}/api/evaluate/${contrib.submission_hash}`,
                    { method: 'POST' }
                )
                
                if (evaluateResponse.ok) {
                    console.log(`   ✅ Vectorized successfully`)
                    successCount++
                } else {
                    const errorText = await evaluateResponse.text()
                    console.log(`   ⚠️  Evaluation returned: ${evaluateResponse.status}`)
                    console.log(`   Error: ${errorText.substring(0, 100)}...`)
                    errorCount++
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`)
                errorCount++
            }
            
            // Small delay to avoid rate limiting
            if (i < withoutVectors.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

        console.log('\n✨ Backfill complete!')
        console.log(`   ✅ Successfully vectorized: ${successCount}`)
        console.log(`   ❌ Errors: ${errorCount}`)
        console.log(`   📊 Total processed: ${withoutVectors.length}`)

    } catch (error) {
        console.error('\n❌ Backfill failed:', error.message)
        process.exit(1)
    }
}

// Run backfill
backfillVectors().catch(console.error)

