import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, pocLogTable } from '@/utils/db/schema'
import { createClient } from '@/utils/supabase/server'
import { debug, debugError } from '@/utils/debug'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    debug('SubmitContribution', 'Submission request received')
    
    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user || !user.email) {
            debug('SubmitContribution', 'Unauthorized submission attempt')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        const formData = await request.formData()
        const title = formData.get('title') as string | null
        const contributor = formData.get('contributor') as string | null || user.email
        const category = formData.get('category') as string | null || 'scientific'
        const text_content = formData.get('text_content') as string | null || ''
        const file = formData.get('file') as File | null
        
        if (!title || !title.trim()) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }
        
        if (!text_content || !text_content.trim()) {
            if (!file) {
                return NextResponse.json(
                    { error: 'Either text content or a file is required' },
                    { status: 400 }
                )
            }
        }
        
        // Check database connection
        if (!process.env.DATABASE_URL) {
            debugError('SubmitContribution', 'DATABASE_URL not configured')
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            )
        }
        
        // Generate submission hash
        const submission_hash = crypto.randomBytes(16).toString('hex')
        
        // Calculate content hash
        const contentToHash = text_content || title
        const content_hash = crypto
            .createHash('sha256')
            .update(contentToHash.toLowerCase().trim())
            .digest('hex')
        
        // Handle file upload if present
        let pdf_path: string | null = null
        if (file) {
            // In production, you'd upload to Supabase Storage or S3
            // For now, we'll store the file name
            pdf_path = file.name
            debug('SubmitContribution', 'File received', { fileName: file.name, size: file.size })
        }
        
        const startTime = Date.now()
        
        // Insert contribution into database
        try {
            await db.insert(contributionsTable).values({
                submission_hash,
                title: title.trim(),
                contributor: contributor || user.email,
                content_hash,
                text_content: text_content?.trim() || null,
                pdf_path,
                status: 'draft',
                category: category || 'scientific',
                metals: [],
                metadata: {}
            })
        } catch (dbError) {
            debugError('SubmitContribution', 'Database insert error', dbError)
            throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
        }
        
        // Log submission event
        try {
            const logId = crypto.randomUUID()
            await db.insert(pocLogTable).values({
                id: logId,
                submission_hash,
                contributor: contributor || user.email,
                event_type: 'submission',
                event_status: 'success',
                title: title.trim(),
                category: category || 'scientific',
                request_data: {
                    title: title.trim(),
                    contributor: contributor || user.email,
                    category: category || 'scientific',
                    has_text_content: !!text_content,
                    has_file: !!file,
                    file_name: file?.name,
                    file_size: file?.size
                },
                response_data: {
                    success: true,
                    submission_hash
                },
                processing_time_ms: Date.now() - startTime,
                created_at: new Date()
            })
        } catch (logError) {
            // Log error but don't fail the submission
            debugError('SubmitContribution', 'Failed to log submission event', logError)
        }
        
        debug('SubmitContribution', 'Contribution submitted successfully', {
            submission_hash,
            title,
            contributor
        })
        
        return NextResponse.json({
            success: true,
            submission_hash
        })
    } catch (error) {
        debugError('SubmitContribution', 'Error submitting contribution', error)
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorDetails = error instanceof Error ? {
            name: error.name,
            stack: error.stack,
            message: error.message
        } : { error: String(error) }
        
        // Return more detailed error for debugging (in production, you might want to hide this)
        return NextResponse.json(
            { 
                error: 'Failed to submit contribution',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
                ...(process.env.NODE_ENV === 'development' ? errorDetails : {})
            },
            { status: 500 }
        )
    }
}

