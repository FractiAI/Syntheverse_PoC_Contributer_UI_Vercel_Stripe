/**
 * NSPFRP Core Principles API
 * 
 * GET /api/nspfrp/core-principles
 * POST /api/nspfrp/core-principles
 * 
 * Returns and validates NSPFRP core principles: Conscious, Natural, Consent, Flow
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getNSPFRPCorePrinciples,
  applyNSPFRPCorePrinciples,
  validateNSPFRPCorePrinciples,
  getCorePrinciplesSnapVibePatterns,
  getCorePrinciplesVibePatterns,
  getCorePrinciplesPromptPatterns,
} from '@/utils/nspfrp/core-principles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Get NSPFRP Core Principles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recursiveDepth = parseInt(searchParams.get('recursiveDepth') || '8', 10);
    const includePatterns = searchParams.get('includePatterns') === 'true';

    const principles = getNSPFRPCorePrinciples(recursiveDepth);

    const response: any = {
      success: true,
      principles,
      message: 'NSPFRP core principles retrieved: Conscious, Natural, Consent, Flow',
    };

    if (includePatterns) {
      response.snapVibePatterns = getCorePrinciplesSnapVibePatterns();
      response.vibePatterns = getCorePrinciplesVibePatterns();
      response.promptPatterns = getCorePrinciplesPromptPatterns();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[NSPFRP Core Principles API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get NSPFRP core principles',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Apply or validate NSPFRP Core Principles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'apply';
    const operation = body.operation || 'NSPFRP operation';
    const recursiveDepth = body.recursiveDepth || 8;

    if (action === 'validate') {
      const validation = validateNSPFRPCorePrinciples(operation, recursiveDepth);
      return NextResponse.json({
        success: true,
        validation,
        message: validation.valid
          ? 'Operation adheres to all NSPFRP core principles'
          : 'Operation has violations of NSPFRP core principles',
      });
    }

    // Default: apply
    const applied = applyNSPFRPCorePrinciples(operation, recursiveDepth);
    return NextResponse.json({
      success: true,
      applied,
      message: 'NSPFRP core principles applied: Conscious, Natural, Consent, Flow',
    });
  } catch (error) {
    console.error('[NSPFRP Core Principles API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to apply/validate NSPFRP core principles',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
