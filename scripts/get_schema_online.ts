/**
 * Get current schema from Supabase online database
 * Uses Supabase REST API to query information_schema
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jfbgdxeumzqzigptbmvp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getSchema() {
  try {
    // Query to get table definitions
    const schemaQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    // Query to get indexes
    const indexQuery = `
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;

    // Query to get foreign keys
    const fkQuery = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `;

    // Execute queries using RPC (we'll use a simpler approach)
    console.log('Fetching schema from Supabase...');

    // Use direct SQL query via REST API
    const { data: columns, error: colsError } = await supabase
      .rpc('exec_sql', {
        query: schemaQuery,
      })
      .catch(() => {
        // RPC might not exist, try alternative
        return { data: null, error: 'RPC not available' };
      });

    if (colsError) {
      console.log('Note: Direct SQL queries via REST API are limited.');
      console.log(
        'Please use Supabase Dashboard SQL Editor or Supabase CLI with proper authentication.'
      );
      console.log('\nTo get schema, run this in Supabase Dashboard SQL Editor:');
      console.log('\n' + schemaQuery);
      return;
    }

    // Generate schema output
    const output: string[] = [];
    output.push('-- Current Schema from Supabase Online Database');
    output.push(`-- Generated: ${new Date().toISOString()}`);
    output.push(`-- Database: ${SUPABASE_URL}`);
    output.push('');

    if (columns && Array.isArray(columns)) {
      // Group by table
      const tables: Record<string, any[]> = {};
      columns.forEach((col: any) => {
        if (!tables[col.table_name]) {
          tables[col.table_name] = [];
        }
        tables[col.table_name].push(col);
      });

      Object.keys(tables).forEach((tableName) => {
        output.push(`-- Table: ${tableName}`);
        output.push(`CREATE TABLE IF NOT EXISTS "${tableName}" (`);

        const cols = tables[tableName];
        const colDefs = cols.map((col: any) => {
          let def = `  "${col.column_name}" ${col.data_type}`;
          if (col.character_maximum_length) {
            def += `(${col.character_maximum_length})`;
          } else if (col.numeric_precision && col.numeric_scale) {
            def += `(${col.numeric_precision},${col.numeric_scale})`;
          }
          if (col.is_nullable === 'NO') {
            def += ' NOT NULL';
          }
          if (col.column_default) {
            def += ` DEFAULT ${col.column_default}`;
          }
          return def;
        });

        output.push(colDefs.join(',\n'));
        output.push(');');
        output.push('');
      });
    }

    const outputPath = path.join(process.cwd(), 'supabase', 'current_schema.sql');
    fs.writeFileSync(outputPath, output.join('\n'));
    console.log(`\nSchema saved to: ${outputPath}`);
    console.log('\nNote: For complete schema with indexes and constraints,');
    console.log('please use Supabase Dashboard SQL Editor or Supabase CLI.');
  } catch (error) {
    console.error('Error fetching schema:', error);
    console.log('\nAlternative: Use Supabase Dashboard SQL Editor to run:');
    console.log(`
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
    `);
  }
}

getSchema();
