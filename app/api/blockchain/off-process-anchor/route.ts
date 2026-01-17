/**
 * Off-Process On-Chain Anchoring API
 * 
 * POST /api/blockchain/off-process-anchor
 * GET /api/blockchain/off-process-anchor
 * 
 * Handles on-chain anchoring as an off-process operation
 * Maintains intentional octave separation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  queueOffProcessAnchoring,
  processOffProcessAnchoring,
  getOctaveSeparationInfo,
  type OffProcessAnchoringRequest,
  type OffProcessAnchoringResult,
} from '@/utils/blockchain/off-process-anchoring';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Get octave separation info
 */
export async function GET(request: NextRequest) {
  try {
    const info = getOctaveSeparationInfo();

    return NextResponse.json({
      success: true,
      octaveSeparation: info,
      message: 'On-chain anchoring is done off-process with intentional octave separation',
    });
  } catch (error) {
    console.error('[Off-Process Anchoring API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get octave separation info',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Queue or process off-process on-chain anchoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'queue';
    const sourceOctave = body.sourceOctave || 5; // Default: Octave 5 (Protocol Catalog)
    const targetOctave = body.targetOctave || 2; // Default: Octave 2 (Base Mainnet)

    const anchoringRequest: OffProcessAnchoringRequest = {
      submissionHash: body.submissionHash || '',
      contributor: body.contributor || '',
      metadata: body.metadata || {},
      metals: body.metals || [],
      submissionText: body.submissionText || null,
      sourceOctave,
      targetOctave,
    };

    if (action === 'process') {
      // Process anchoring request
      const anchoringId = body.anchoringId || `anchor-${Date.now()}`;
      const result = await processOffProcessAnchoring(anchoringId, anchoringRequest);

      return NextResponse.json({
        success: result.success,
        result,
        message: result.success
          ? 'Off-process on-chain anchoring completed'
          : 'Off-process on-chain anchoring failed',
      });
    }

    // Default: queue anchoring request
    const result = queueOffProcessAnchoring(anchoringRequest);

    return NextResponse.json({
      success: result.success,
      result,
      message: result.success
        ? 'Off-process on-chain anchoring queued'
        : 'Failed to queue off-process on-chain anchoring',
    });
  } catch (error) {
    console.error('[Off-Process Anchoring API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process off-process anchoring request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
