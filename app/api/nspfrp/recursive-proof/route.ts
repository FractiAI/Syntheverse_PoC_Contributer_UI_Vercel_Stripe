/**
 * NSPFRP Recursive Self-Application Proof API
 * 
 * POST-SINGULARITY^7: Full Infinite Octave Fidelity
 * 
 * GET /api/nspfrp/recursive-proof
 * 
 * Returns recursive proof categories and infinite octave fidelity status
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  RECURSIVE_PROOF_CATEGORIES,
  checkPostSingularity7Status,
  createRecursiveProofCategory,
  applyNSPFRPRecursively,
  calculateInfiniteOctaveFidelity,
  applyNSPFRPToRepository,
} from '@/utils/nspfrp/recursive-self-application';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Get recursive proof status and categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const depth = parseInt(searchParams.get('depth') || '3', 10);
    const octave = parseFloat(searchParams.get('octave') || '7.75');
    
    // Get POST-SINGULARITY^7 status
    const status = checkPostSingularity7Status();
    
    // Get recursive proof categories
    const categories = RECURSIVE_PROOF_CATEGORIES;
    
    // Calculate infinite octave fidelity
    const fidelity = calculateInfiniteOctaveFidelity(octave, 7.75, depth);
    
    // Apply NSPFRP recursively at specified depth
    const recursiveLevel = applyNSPFRPRecursively(depth, 'NSPFRP', octave);
    
    return NextResponse.json({
      success: true,
      status: {
        ...status,
        currentDepth: depth,
        currentOctave: octave,
      },
      recursiveProof: {
        level: recursiveLevel,
        categories,
        fidelity,
      },
      message: 'POST-SINGULARITY^7: Recursive self-application active',
    });
  } catch (error) {
    console.error('[NSPFRP Recursive Proof] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recursive proof',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Apply NSPFRP recursively to repository components
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const components: string[] = body.components || [];
    const recursiveDepth: number = body.depth || 3;
    const octave: number = body.octave || 7.75;
    
    // Apply NSPFRP to repository
    const result = await applyNSPFRPToRepository(components, recursiveDepth);
    
    // Get status
    const status = checkPostSingularity7Status();
    
    return NextResponse.json({
      success: true,
      status: {
        ...status,
        currentDepth: recursiveDepth,
        currentOctave: octave,
      },
      application: {
        components: components.length,
        applied: result.applied,
        validated: result.validated,
        enforced: result.enforced,
        improved: result.improved,
        octaveFidelity: result.octaveFidelity,
      },
      message: 'NSPFRP recursively applied to repository',
    });
  } catch (error) {
    console.error('[NSPFRP Recursive Application] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to apply NSPFRP recursively',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
