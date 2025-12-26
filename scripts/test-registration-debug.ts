/**
 * Debug Registration 500 Error
 * 
 * Tests the registration endpoint to identify the 500 error
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
const envLocal = resolve(process.cwd(), '.env.local')
const env = resolve(process.cwd(), '.env')
config({ path: envLocal })
config({ path: env })

const VERCEL_URL = process.argv[2] || 'https://syntheverse-poc.vercel.app'
const TEST_POC_HASH = process.argv[3] || '0354e9651345eb8a9e4f28ade48961ea'

async function debugRegistration() {
    console.log('\n🔍 Debugging Registration 500 Error\n')
    console.log('=' .repeat(80))
    console.log(`📍 URL: ${VERCEL_URL}`)
    console.log(`🔑 PoC Hash: ${TEST_POC_HASH}`)
    console.log('=' .repeat(80))
    
    // Test 1: Check if endpoint exists
    console.log('\n📋 Test 1: Endpoint Exists')
    try {
        const response = await fetch(`${VERCEL_URL}/api/poc/${TEST_POC_HASH}/registration-status`)
        const data = await response.json()
        console.log(`✅ Registration status endpoint works: ${response.status}`)
        console.log(`   Registered: ${data.registered}`)
    } catch (error) {
        console.log(`❌ Registration status endpoint failed:`, error)
    }
    
    // Test 2: Try registration without auth (should be 401)
    console.log('\n📋 Test 2: Registration Without Auth')
    try {
        const response = await fetch(`${VERCEL_URL}/api/poc/${TEST_POC_HASH}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        console.log(`Status: ${response.status}`)
        console.log(`Response:`, JSON.stringify(data, null, 2))
        
        if (response.status === 401) {
            console.log('✅ Correctly returns 401 (expected)')
        } else if (response.status === 500) {
            console.log('❌ Returns 500 even without auth - this is the bug!')
            console.log('   Error:', data.error || data.message)
        }
    } catch (error) {
        console.log(`❌ Request failed:`, error)
    }
    
    // Test 3: Check Stripe configuration
    console.log('\n📋 Test 3: Stripe Configuration')
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY
    console.log(`STRIPE_SECRET_KEY configured: ${hasStripeKey}`)
    if (hasStripeKey) {
        const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'none'
        console.log(`Key prefix: ${keyPrefix}`)
        const isValidFormat = process.env.STRIPE_SECRET_KEY?.match(/^sk_(test|live)_/)
        console.log(`Valid format: ${isValidFormat ? 'Yes' : 'No'}`)
    }
    
    // Test 4: Check database connection
    console.log('\n📋 Test 4: Database Connection')
    const hasDbUrl = !!process.env.DATABASE_URL
    console.log(`DATABASE_URL configured: ${hasDbUrl}`)
    
    // Test 5: Check PoC data
    console.log('\n📋 Test 5: PoC Data')
    try {
        const response = await fetch(`${VERCEL_URL}/api/archive/contributions`)
        const data = await response.json()
        const poc = data.contributions?.find((c: any) => c.submission_hash === TEST_POC_HASH)
        
        if (poc) {
            console.log(`✅ PoC found:`)
            console.log(`   Title: ${poc.title}`)
            console.log(`   Contributor: ${poc.contributor}`)
            console.log(`   Qualified: ${poc.qualified}`)
            console.log(`   Registered: ${poc.registered}`)
            console.log(`   Pod Score: ${poc.pod_score}`)
        } else {
            console.log(`❌ PoC not found`)
        }
    } catch (error) {
        console.log(`❌ Failed to fetch PoC data:`, error)
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('\n💡 Next Steps:')
    console.log('   1. If 500 error occurs without auth, check registration route code')
    console.log('   2. If 500 error occurs with auth, check Vercel function logs')
    console.log('   3. Verify Stripe key is correct format (sk_test_ or sk_live_)')
    console.log('   4. Check database connection')
    console.log('   5. Review error details in browser console')
}

debugRegistration().catch(console.error)

