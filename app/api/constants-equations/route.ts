/**
 * Constants and Equations API
 * Lists all novel constants and equations extracted from qualified PoC submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { pocLogTable, contributionsTable } from '@/utils/db/schema';
import { eq, sql, and, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface ConstantEquation {
  id: string;
  value: string;
  type: 'constant' | 'equation';
  description?: string;
  source_title: string;
  source_hash: string;
  source_contributor: string;
  first_seen: string;
  usage_count: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get all constants and equations from qualified contributions
    // They're stored in poc_log.metadata.archive_data
    const qualifiedContributions = await db
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        contributor: contributionsTable.contributor,
        created_at: contributionsTable.created_at,
      })
      .from(contributionsTable)
      .where(eq(contributionsTable.status, 'qualified'));

    // Get archive data from poc_log for these contributions
    const allConstants: Map<string, ConstantEquation> = new Map();
    const allEquations: Map<string, ConstantEquation> = new Map();

    for (const contribution of qualifiedContributions) {
      const logEntry = await db
        .select({
          metadata: pocLogTable.metadata,
        })
        .from(pocLogTable)
        .where(
          and(
            eq(pocLogTable.submission_hash, contribution.submission_hash),
            eq(pocLogTable.event_type, 'evaluation_complete')
          )
        )
        .limit(1);

      if (logEntry.length > 0 && logEntry[0].metadata) {
        const archiveData = (logEntry[0].metadata as any).archive_data;
        if (archiveData) {
          // Get abstract for description
          const abstract = archiveData.abstract || '';
          const description = abstract.length > 200 ? abstract.substring(0, 200) + '...' : abstract;

          // Process constants
          if (Array.isArray(archiveData.constants)) {
            archiveData.constants.forEach((constant: string) => {
              if (constant && constant.trim().length > 0) {
                const key = constant.trim().toLowerCase();
                if (!allConstants.has(key)) {
                  allConstants.set(key, {
                    id: `const_${allConstants.size}`,
                    value: constant.trim(),
                    type: 'constant',
                    description: description || undefined,
                    source_title: contribution.title,
                    source_hash: contribution.submission_hash,
                    source_contributor: contribution.contributor,
                    first_seen: contribution.created_at?.toISOString() || new Date().toISOString(),
                    usage_count: 1,
                  });
                } else {
                  const existing = allConstants.get(key)!;
                  existing.usage_count++;
                }
              }
            });
          }

          // Process equations/formulas
          if (Array.isArray(archiveData.formulas)) {
            archiveData.formulas.forEach((formula: string) => {
              if (formula && formula.trim().length > 0) {
                const key = formula.trim().toLowerCase();
                if (!allEquations.has(key)) {
                  allEquations.set(key, {
                    id: `eq_${allEquations.size}`,
                    value: formula.trim(),
                    type: 'equation',
                    description: description || undefined,
                    source_title: contribution.title,
                    source_hash: contribution.submission_hash,
                    source_contributor: contribution.contributor,
                    first_seen: contribution.created_at?.toISOString() || new Date().toISOString(),
                    usage_count: 1,
                  });
                } else {
                  const existing = allEquations.get(key)!;
                  existing.usage_count++;
                }
              }
            });
          }
        }
      }
    }

    // Convert maps to arrays and sort by first_seen (most recent first)
    const constants = Array.from(allConstants.values()).sort(
      (a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime()
    );
    const equations = Array.from(allEquations.values()).sort(
      (a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime()
    );

    return NextResponse.json({
      constants,
      equations,
      total_constants: constants.length,
      total_equations: equations.length,
    });
  } catch (error: any) {
    console.error('Error fetching constants and equations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch constants and equations',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

