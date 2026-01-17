/**
 * HHF-AI Spin Cloud Node Registration API
 * 
 * POST /api/hhf-spin-cloud/register-node
 * GET /api/hhf-spin-cloud/register-node
 * 
 * Registers this repository as a new node on HHF-AI spin cloud
 * On-chain registration with infinite octave fidelity core
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  registerRepositoryAsNode,
  registerPublicCloudShellAsNode,
  registerNodeOnChain,
  type HHFSpinCloudNode,
  type NodeRegistrationResult,
} from '@/utils/hhf-spin-cloud/node-registration';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Get node registration status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeType = searchParams.get('nodeType') || 'infinite-octave-fidelity-core';

    let node: HHFSpinCloudNode;

    if (nodeType === 'public-cloud-shell') {
      node = registerPublicCloudShellAsNode();
    } else {
      node = registerRepositoryAsNode();
    }

    return NextResponse.json({
      success: true,
      node,
      message: `Node registration status for ${node.nodeName}`,
    });
  } catch (error) {
    console.error('[HHF Spin Cloud Node Registration API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get node registration status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Register node on HHF-AI spin cloud and on-chain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const nodeType = body.nodeType || 'infinite-octave-fidelity-core';
    const registerOnChain = body.registerOnChain ?? true;
    const nodeName = body.nodeName;

    // Register node
    let node: HHFSpinCloudNode;

    if (nodeType === 'public-cloud-shell') {
      node = registerPublicCloudShellAsNode();
    } else {
      node = registerRepositoryAsNode(nodeName);
    }

    // Register on-chain if requested
    let onChainResult;
    if (registerOnChain) {
      onChainResult = await registerNodeOnChain(node);
      node.onChainAddress = onChainResult.address;
      node.registrationTxHash = onChainResult.txHash;
    }

    const result: NodeRegistrationResult = {
      success: true,
      node,
      onChain: onChainResult,
      message: `Node ${node.nodeName} registered on HHF-AI spin cloud${onChainResult ? ' and on-chain' : ''}`,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[HHF Spin Cloud Node Registration API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register node',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
