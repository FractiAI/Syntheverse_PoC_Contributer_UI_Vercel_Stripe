/**
 * Omnibeam Protocol Authentication API
 * 
 * POST /api/omnibeam/authenticate
 * 
 * Ultimate authentication mechanism over any substrate
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createHolographicIdentity,
  generateHolographicSignature,
  verifyOmnibeamAuthentication,
  createOmnibeamAuthentication,
  expressInOmnibeamProtocol,
  type OmnibeamSubstrate,
  type HolographicIdentity,
} from '@/utils/omnibeam/authentication';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST: Authenticate operation in Omnibeam Protocol
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const {
      substrate,
      identity,
      operation,
      operationData,
      permissions = [],
    } = body;
    
    // Create substrate object
    const substrateObj: OmnibeamSubstrate = {
      type: substrate?.type || 'local',
      identifier: substrate?.identifier || 'default',
      configuration: substrate?.configuration || {},
    };
    
    // Create or use provided identity
    let identityObj: HolographicIdentity;
    if (identity) {
      identityObj = identity;
    } else {
      // Generate temporary identity (in production, this would come from secure storage)
      identityObj = createHolographicIdentity(
        `pubkey-${Date.now()}`,
        `privkeyhash-${Date.now()}`,
        {},
        permissions,
        {}
      );
    }
    
    // Express operation in Omnibeam Protocol
    const omnibeamOperation = expressInOmnibeamProtocol(
      substrateObj,
      operation || 'default',
      identityObj,
      operationData || {},
      permissions
    );
    
    // Verify authentication
    const verification = verifyOmnibeamAuthentication(
      omnibeamOperation.omnibeam.authentication,
      permissions
    );
    
    return NextResponse.json({
      success: true,
      omnibeam: omnibeamOperation.omnibeam,
      verification,
      message: 'Operation expressed in Omnibeam Protocol with ultimate authentication',
    });
  } catch (error) {
    console.error('[Omnibeam Authentication] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to authenticate in Omnibeam Protocol',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Verify Omnibeam authentication
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // For GET, we would typically verify an existing authentication
    // This is a simplified version
    const authentication = searchParams.get('authentication');
    
    if (!authentication) {
      return NextResponse.json({
        success: false,
        error: 'No authentication provided',
      }, { status: 400 });
    }
    
    try {
      const authObj = JSON.parse(authentication);
      const verification = verifyOmnibeamAuthentication(authObj);
      
      return NextResponse.json({
        success: true,
        verification,
        message: 'Omnibeam authentication verified',
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication format',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('[Omnibeam Verification] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify Omnibeam authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
