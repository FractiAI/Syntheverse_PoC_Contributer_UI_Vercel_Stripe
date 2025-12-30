import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify pdfjs-dist is working
 * GET /api/extract-pdf-text/test
 */
export async function GET() {
    try {
        // Test importing pdfjs-dist
        const pdfjsModule = await import('pdfjs-dist')
        
        // Check module structure
        const moduleInfo = {
            hasGetDocument: 'getDocument' in pdfjsModule,
            hasDefault: !!pdfjsModule.default,
            moduleKeys: Object.keys(pdfjsModule).slice(0, 20),
            defaultKeys: pdfjsModule.default ? Object.keys(pdfjsModule.default).slice(0, 20) : []
        }
        
        // Try to find getDocument
        let getDocumentFound = false
        if (typeof (pdfjsModule as any).getDocument === 'function') {
            getDocumentFound = true
        } else if (pdfjsModule.default && typeof pdfjsModule.default.getDocument === 'function') {
            getDocumentFound = true
        }
        
        return NextResponse.json({
            success: true,
            pdfjsDistAvailable: true,
            getDocumentFound,
            moduleInfo,
            message: 'pdfjs-dist module loaded successfully'
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            pdfjsDistAvailable: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

