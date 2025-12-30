import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Server-side PDF text extraction API
 * Similar to the Python scraper's extract_text_from_pdf function
 * Uses pdfjs-dist on the server where it's more reliable
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate PDF
        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'File must be a PDF' },
                { status: 400 }
            )
        }

        // Read file as buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Import pdfjs-dist on the server (more reliable than client-side)
        // Similar to Python scraper's PdfReader approach
        const pdfjsModule = await import('pdfjs-dist')
        
        // Get getDocument function - try multiple access patterns
        const getDocument = (pdfjsModule as any).getDocument || 
                          pdfjsModule.default?.getDocument ||
                          (pdfjsModule as any).default?.getDocument

        if (!getDocument || typeof getDocument !== 'function') {
            throw new Error('PDF.js getDocument function not found')
        }

        // Set worker (server-side doesn't need worker, but set it to avoid errors)
        const GlobalWorkerOptions = (pdfjsModule as any).GlobalWorkerOptions || 
                                   pdfjsModule.default?.GlobalWorkerOptions
        if (GlobalWorkerOptions) {
            GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.449/pdf.worker.min.mjs`
        }

        // Extract text from PDF - similar to Python's PdfReader approach
        const loadingTask = getDocument({ 
            data: buffer,
            verbosity: 0
        })

        const pdf = await loadingTask.promise
        const textParts: string[] = []

        // Extract text from each page (limit to 50 pages)
        const maxPages = Math.min(pdf.numPages, 50)
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
                const page = await pdf.getPage(pageNum)
                const textContent = await page.getTextContent()
                
                if (textContent && textContent.items && Array.isArray(textContent.items)) {
                    const pageText = textContent.items
                        .map((item: any) => item.str || '')
                        .filter((str: string) => str.trim().length > 0)
                        .join(' ')
                    
                    if (pageText.trim()) {
                        textParts.push(pageText)
                    }
                }
            } catch (pageError) {
                console.warn(`Error extracting text from page ${pageNum}:`, pageError)
                // Continue with other pages
            }
        }

        // Combine all pages with double newlines (similar to Python: "\n\n".join(text_parts))
        const extractedText = textParts.join('\n\n')

        if (pdf.numPages > 50) {
            return NextResponse.json({
                success: true,
                text: extractedText + '\n\n[Content truncated - PDF has more than 50 pages]',
                pagesExtracted: maxPages,
                totalPages: pdf.numPages
            })
        }

        return NextResponse.json({
            success: true,
            text: extractedText,
            pagesExtracted: maxPages,
            totalPages: pdf.numPages
        })

    } catch (error) {
        console.error('PDF extraction error:', error)
        return NextResponse.json(
            { 
                error: 'Failed to extract PDF text',
                message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}

