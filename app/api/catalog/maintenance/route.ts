/**
 * Catalog Maintenance API
 * 
 * POST /api/catalog/maintenance
 * 
 * Performs resynthesis, organization, tuning, and duplicate prevention
 * on each catalog snap
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  performCatalogMaintenance,
  createCatalogSnap,
  type CatalogProtocol,
} from '@/utils/catalog/maintenance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST: Perform catalog maintenance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const protocols: CatalogProtocol[] = body.protocols || [];
    const sourceProtocols: CatalogProtocol[] = body.sourceProtocols || [];
    
    // Perform complete maintenance
    const maintenance = performCatalogMaintenance(protocols, sourceProtocols);
    
    // Create catalog snap
    const snap = createCatalogSnap(protocols, sourceProtocols);
    
    return NextResponse.json({
      success: true,
      maintenance,
      snap: snap.snap,
      catalog: {
        total: snap.catalog.length,
        organized: {
          categories: Object.keys(snap.organized.byCategory).length,
          octaves: Object.keys(snap.organized.byOctave).length,
          statuses: Object.keys(snap.organized.byStatus).length,
        },
      },
      message: 'Catalog maintenance complete: resynthesized, organized, tuned, duplicates prevented',
    });
  } catch (error) {
    console.error('[Catalog Maintenance API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform catalog maintenance',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Get catalog maintenance status
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      maintenance: {
        operations: [
          'resynthesize',
          'organize',
          'tune',
          'prevent-duplicates',
        ],
        description: 'Catalog maintenance performs resynthesis, organization, tuning, and duplicate prevention on each snap',
        status: 'active',
      },
      message: 'Catalog maintenance system active',
    });
  } catch (error) {
    console.error('[Catalog Maintenance API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get maintenance status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
