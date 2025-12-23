import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    try {
        // Check DATABASE_URL first
        const dbUrl = process.env.DATABASE_URL
        if (!dbUrl) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set',
                connection: 'failed',
                hint: 'Please set DATABASE_URL in Vercel environment variables'
            }, { status: 500 })
        }
        
        // Parse DATABASE_URL to show connection details (without password)
        let connectionInfo = {}
        try {
            const url = new URL(dbUrl)
            connectionInfo = {
                hostname: url.hostname,
                port: url.port || '5432',
                database: url.pathname.replace('/', ''),
                protocol: url.protocol,
                has_password: !!url.password
            }
        } catch (e) {
            connectionInfo = { error: 'Invalid URL format' }
        }
        
        // Test database connection
        const connectionTest = await db.execute(sql`SELECT 1 as test`)
        
        // Check if contributions table exists
        const tableCheck = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'contributions'
            ) as exists;
        `)
        
        const tableExists = (tableCheck as any)?.[0]?.exists || false
        
        // Try to get table structure
        let tableStructure = null
        if (tableExists) {
            try {
                const structure = await db.execute(sql`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_schema = 'public' 
                    AND table_name = 'contributions'
                    ORDER BY ordinal_position;
                `)
                tableStructure = structure
            } catch (e) {
                // Ignore structure query errors
            }
        }
        
        return NextResponse.json({
            success: true,
            connection: 'ok',
            connection_info: connectionInfo,
            contributions_table_exists: tableExists,
            table_structure: tableStructure,
            message: tableExists 
                ? 'Contributions table exists' 
                : 'Contributions table does not exist - please run migrations'
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorCode = (error as any)?.code || undefined
        
        // Provide helpful hints based on error type
        let hint = 'Check DATABASE_URL configuration in Vercel'
        if (errorMessage.includes('ENOTFOUND')) {
            hint = 'Database hostname cannot be resolved. Check if DATABASE_URL hostname is correct.'
        } else if (errorMessage.includes('ECONNREFUSED')) {
            hint = 'Database connection refused. Check if database is accessible and port is correct.'
        } else if (errorMessage.includes('password')) {
            hint = 'Database authentication failed. Check if password in DATABASE_URL is correct.'
        } else if (errorMessage.includes('timeout')) {
            hint = 'Database connection timeout. Check network connectivity and database availability.'
        }
        
        return NextResponse.json({
            success: false,
            error: errorMessage,
            error_code: errorCode,
            connection: 'failed',
            hint,
            connection_info: process.env.DATABASE_URL ? {
                has_url: true,
                url_length: process.env.DATABASE_URL.length,
                // Don't expose full URL, but show if it's set
            } : {
                has_url: false
            }
        }, { status: 500 })
    }
}

