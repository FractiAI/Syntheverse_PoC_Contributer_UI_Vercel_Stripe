import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify pdf-text-extract is working
 * GET /api/extract-pdf-text/test
 */
export async function GET() {
    try {
        // Test importing pdf-text-extract
        const pdfTextExtract = (await import('pdf-text-extract')).default

        // Check module structure
        const moduleInfo = {
            moduleType: typeof pdfTextExtract,
            isFunction: typeof pdfTextExtract === 'function',
            moduleKeys: Object.keys(pdfTextExtract || {}).slice(0, 10)
        }

        return NextResponse.json({
            success: true,
            pdfTextExtractAvailable: true,
            moduleInfo,
            message: 'pdf-text-extract module loaded successfully'
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            pdfTextExtractAvailable: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

