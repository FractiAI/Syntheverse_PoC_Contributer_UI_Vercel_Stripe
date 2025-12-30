import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Server-side PDF text extraction API
 * Similar to the Python scraper's extract_text_from_pdf function
 * Uses pdfjs-dist on server (works better in serverless than pdf-parse)
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now()
    
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

        console.log(`[PDF Extract] Starting extraction for file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

        // Read file as Uint8Array (pdfjs-dist prefers this)
        let arrayBuffer: ArrayBuffer
        try {
            arrayBuffer = await file.arrayBuffer()
            console.log(`[PDF Extract] File read successfully, arrayBuffer size: ${arrayBuffer.byteLength} bytes`)
        } catch (readError) {
            console.error('[PDF Extract] Failed to read file:', readError)
            throw new Error(`Failed to read file: ${readError instanceof Error ? readError.message : String(readError)}`)
        }
        
        const uint8Array = new Uint8Array(arrayBuffer)
        console.log(`[PDF Extract] Uint8Array created, length: ${uint8Array.length} bytes`)
        
        // Verify it looks like a PDF (starts with %PDF)
        try {
            const pdfHeader = String.fromCharCode(...uint8Array.slice(0, Math.min(4, uint8Array.length)))
            if (!pdfHeader.startsWith('%PDF')) {
                console.warn(`[PDF Extract] Warning: File does not start with PDF header. Got: ${pdfHeader}`)
            } else {
                console.log(`[PDF Extract] PDF header verified: ${pdfHeader}`)
            }
        } catch (headerError) {
            console.warn('[PDF Extract] Could not verify PDF header:', headerError)
        }

        // Use pdfjs-dist on server - import and configure properly
        const pdfjs = await import('pdfjs-dist')
        
        // In v5.x, getDocument is typically a named export
        // Access it directly from the module
        const getDocument = (pdfjs as any).getDocument || 
                          pdfjs.default?.getDocument ||
                          (pdfjs as any).default?.getDocument
        
        if (!getDocument || typeof getDocument !== 'function') {
            console.error('[PDF Extract] getDocument not found. Module keys:', Object.keys(pdfjs).slice(0, 20))
            throw new Error('PDF.js getDocument function not available')
        }
        
        // Disable worker for server-side (not needed in Node.js)
        if ((pdfjs as any).GlobalWorkerOptions) {
            (pdfjs as any).GlobalWorkerOptions.workerSrc = ''
        } else if (pdfjs.default?.GlobalWorkerOptions) {
            pdfjs.default.GlobalWorkerOptions.workerSrc = ''
        }

        // Load PDF document
        let loadingTask: any
        let pdf: any
        
        try {
            console.log('[PDF Extract] Calling getDocument...')
            loadingTask = getDocument({ 
                data: uint8Array,
                verbosity: 0,
                useSystemFonts: false,
                disableFontFace: true
            })
            
            pdf = await loadingTask.promise
            console.log(`[PDF Extract] PDF loaded successfully, pages: ${pdf.numPages}`)
        } catch (loadError) {
            console.error('[PDF Extract] Error loading PDF:', loadError)
            throw new Error(`Failed to load PDF: ${loadError instanceof Error ? loadError.message : String(loadError)}`)
        }

        // Extract text from each page (similar to Python: [page.extract_text() for page in reader.pages])
        const textParts: string[] = []
        const maxPages = Math.min(pdf.numPages, 50)
        
        console.log(`[PDF Extract] Extracting text from ${maxPages} pages...`)
        
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
                console.warn(`[PDF Extract] Error extracting text from page ${pageNum}:`, pageError)
                // Continue with other pages
            }
        }

        // Combine all pages with double newlines (similar to Python: "\n\n".join(text_parts))
        let extractedText = textParts.join('\n\n')
        
        console.log(`[PDF Extract] Extracted ${extractedText.length} characters from ${textParts.length} pages`)

        // Clean up the text (similar to Python scraper's text cleaning)
        // Remove excessive whitespace
        extractedText = extractedText.replace(/\s+/g, ' ').trim()
        // Normalize line breaks
        extractedText = extractedText.replace(/\n\s*\n\s*\n+/g, '\n\n')

        // Limit to reasonable length (equivalent to 50 pages)
        const maxLength = 500000 // ~50 pages of text
        if (extractedText.length > maxLength) {
            extractedText = extractedText.substring(0, maxLength) + '\n\n[Content truncated - PDF text exceeds maximum length]'
        }

        const elapsed = Date.now() - startTime
        console.log(`[PDF Extract] Extraction completed in ${elapsed}ms`)

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
        const elapsed = Date.now() - startTime
        console.error(`[PDF Extract] Error after ${elapsed}ms:`, error)
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined
        
        // Log full error details for debugging
        console.error('[PDF Extract] Full error details:', {
            message: errorMessage,
            stack: errorStack,
            name: error instanceof Error ? error.name : undefined,
            elapsed
        })
        
        // Return detailed error for debugging (even in production for now)
        return NextResponse.json(
            { 
                error: 'Failed to extract PDF text',
                message: errorMessage,
                // Include detailed error info to help debug
                details: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview' ? {
                    stack: errorStack,
                    name: error instanceof Error ? error.name : undefined,
                    elapsed: Date.now() - startTime
                } : {
                    elapsed: Date.now() - startTime
                }
            },
            { status: 500 }
        )
    }
}

