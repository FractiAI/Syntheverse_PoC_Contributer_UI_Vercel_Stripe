/**
 * Snap Vibe Catalog API
 * 
 * POST /api/snap-vibe/catalog
 * GET /api/snap-vibe/catalog
 * 
 * Continuously captures and integrates Snap Vibe operators and language patterns
 * Performs maintenance (resynthesize, organize, tune, prevent duplicates) on each snap
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  captureSnapVibeOperator,
  captureSnapVibePattern,
  performSnapVibeCatalogMaintenance,
  createSnapVibeCatalogSnap,
  initializeSnapVibeCatalog,
  type SnapVibeOperator,
  type SnapVibeLanguagePattern,
  type SnapVibeCatalog,
} from '@/utils/snap-vibe/catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory catalog (in production, this would be stored in database)
let catalogCache: SnapVibeCatalog | null = null;

/**
 * GET: Get Snap Vibe Catalog
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize catalog if not exists
    if (!catalogCache) {
      catalogCache = initializeSnapVibeCatalog();
    }

    // Perform maintenance on each request (continuous capture and integration)
    const { catalog, maintenance } = performSnapVibeCatalogMaintenance(
      catalogCache,
      [],
      []
    );

    // Update cache
    catalogCache = catalog;

    return NextResponse.json({
      success: true,
      catalog,
      maintenance,
      message: 'Snap Vibe catalog retrieved with maintenance performed',
    });
  } catch (error) {
    console.error('[Snap Vibe Catalog API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get Snap Vibe catalog',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Capture and integrate new operators/patterns
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Initialize catalog if not exists
    if (!catalogCache) {
      catalogCache = initializeSnapVibeCatalog();
    }

    // Capture new operators
    const newOperators: SnapVibeOperator[] = [];
    if (body.operators && Array.isArray(body.operators)) {
      body.operators.forEach((op: any) => {
        const captured = captureSnapVibeOperator({
          id: op.id || `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: op.name || 'Unnamed Operator',
          type: op.type || 'snap',
          pattern: op.pattern || '',
          description: op.description || '',
          category: op.category || 'general',
          octave: op.octave || 5.0,
          usage: op.usage || [],
          examples: op.examples || [],
          metadata: op.metadata || {},
        });
        newOperators.push(captured);
      });
    }

    // Capture new patterns
    const newPatterns: SnapVibeLanguagePattern[] = [];
    if (body.patterns && Array.isArray(body.patterns)) {
      body.patterns.forEach((p: any) => {
        const captured = captureSnapVibePattern({
          id: p.id || `pat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: p.name || 'Unnamed Pattern',
          type: p.type || 'snap',
          pattern: p.pattern || '',
          syntax: p.syntax || p.pattern || '',
          description: p.description || '',
          category: p.category || 'general',
          examples: p.examples || [],
          metadata: p.metadata || {},
        });
        newPatterns.push(captured);
      });
    }

    // Perform maintenance with new operators/patterns
    const { catalog, maintenance } = performSnapVibeCatalogMaintenance(
      catalogCache,
      newOperators,
      newPatterns
    );

    // Create snap
    const snap = createSnapVibeCatalogSnap(catalog, newOperators, newPatterns);

    // Update cache
    catalogCache = catalog;

    return NextResponse.json({
      success: true,
      snap: snap.snap,
      catalog,
      maintenance,
      captured: {
        operators: newOperators.length,
        patterns: newPatterns.length,
      },
      message: 'Snap Vibe operators and patterns captured and integrated with maintenance',
    });
  } catch (error) {
    console.error('[Snap Vibe Catalog API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to capture and integrate Snap Vibe operators/patterns',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
