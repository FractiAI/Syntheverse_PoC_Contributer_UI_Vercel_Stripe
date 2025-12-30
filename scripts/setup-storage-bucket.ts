/**
 * Setup Supabase Storage Bucket for PoC PDF Files
 * 
 * Creates the 'poc-files' storage bucket if it doesn't exist
 * and sets up proper permissions for public access.
 * 
 * Usage:
 *   npx tsx scripts/setup-storage-bucket.ts
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (admin access)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const BUCKET_NAME = 'poc-files'

async function setupStorageBucket() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing required environment variables:')
        console.error('   - NEXT_PUBLIC_SUPABASE_URL')
        console.error('   - SUPABASE_SERVICE_ROLE_KEY')
        console.error('\nPlease set these in your .env.local file')
        process.exit(1)
    }

    // Create Supabase admin client with service role key (has admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    console.log('📦 Setting up Supabase Storage bucket...')
    console.log(`   Bucket name: ${BUCKET_NAME}`)
    console.log(`   Supabase URL: ${supabaseUrl}\n`)

    try {
        // Check if bucket already exists
        const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

        if (listError) {
            throw new Error(`Failed to list buckets: ${listError.message}`)
        }

        const bucketExists = existingBuckets?.some(bucket => bucket.name === BUCKET_NAME)

        if (bucketExists) {
            console.log(`✅ Bucket '${BUCKET_NAME}' already exists`)
            
            // Update bucket settings to ensure it's public
            const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
                allowedMimeTypes: ['application/pdf']
            })

            if (updateError) {
                console.warn(`⚠️  Warning: Could not update bucket settings: ${updateError.message}`)
            } else {
                console.log(`✅ Bucket settings updated (public access enabled)`)
            }
        } else {
            // Create the bucket
            console.log(`📦 Creating bucket '${BUCKET_NAME}'...`)
            
            const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true, // Allow public access to files
                fileSizeLimit: 50 * 1024 * 1024, // 50MB limit per file
                allowedMimeTypes: ['application/pdf'] // Only allow PDF files
            })

            if (error) {
                throw new Error(`Failed to create bucket: ${error.message}`)
            }

            console.log(`✅ Bucket '${BUCKET_NAME}' created successfully!`)
            console.log(`   Public access: Enabled`)
            console.log(`   File size limit: 50MB`)
            console.log(`   Allowed MIME types: application/pdf`)
        }

        // Test upload permissions
        console.log('\n🧪 Testing bucket access...')
        const testPath = 'test/test-file.txt'
        const testContent = Buffer.from('test content')

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(testPath, testContent, {
                contentType: 'text/plain',
                upsert: true
            })

        if (uploadError) {
            console.warn(`⚠️  Warning: Test upload failed: ${uploadError.message}`)
            console.warn(`   This might indicate permission issues. Check your RLS policies.`)
        } else {
            console.log('✅ Test upload successful')
            
            // Clean up test file
            await supabase.storage.from(BUCKET_NAME).remove([testPath])
            console.log('✅ Test file cleaned up')
        }

        console.log('\n✨ Storage bucket setup complete!')
        console.log(`\n📝 Next steps:`)
        console.log(`   1. Verify bucket exists in Supabase Dashboard → Storage`)
        console.log(`   2. PDF files will be stored at: poc-submissions/{submission_hash}/{filename}`)
        console.log(`   3. Files are publicly accessible via the public URL\n`)

    } catch (error) {
        console.error('\n❌ Error setting up storage bucket:')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Run the setup
setupStorageBucket().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})

