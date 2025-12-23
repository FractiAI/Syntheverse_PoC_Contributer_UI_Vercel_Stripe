import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    try {
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
            contributions_table_exists: tableExists,
            table_structure: tableStructure,
            message: tableExists 
                ? 'Contributions table exists' 
                : 'Contributions table does not exist - please run migrations'
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return NextResponse.json({
            success: false,
            error: errorMessage,
            connection: 'failed'
        }, { status: 500 })
    }
}

