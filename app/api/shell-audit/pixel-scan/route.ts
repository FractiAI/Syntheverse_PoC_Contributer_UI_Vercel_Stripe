/**
 * Shell Audit: Pixel Scan API
 * 
 * GET /api/shell-audit/pixel-scan
 * POST /api/shell-audit/pixel-scan
 * 
 * On-demand pixel-level scanning for entire shell/cloud/sandbox
 * Accessible from Hero Hosted AI Console
 * Snap hardening shell protocols
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  scanPixel,
  scanRegion,
  auditShellState,
  applySnapHardeningShellProtocol,
  type PixelScanRequest,
  type PixelScanResult,
  type ShellStateAudit,
} from '@/utils/shell-audit/pixel-scan';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Get shell state audit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shell = (searchParams.get('shell') as 'shell' | 'cloud' | 'sandbox' | 'all') || 'all';
    const hardeningLevel = (searchParams.get('hardeningLevel') as 'snap' | 'hard' | 'full') || 'snap';
    const depth = parseInt(searchParams.get('depth') || '8', 10);
    const audit = searchParams.get('audit') === 'true';

    if (audit) {
      // Perform full state audit
      const auditResult = auditShellState(shell, hardeningLevel, depth);
      return NextResponse.json({
        success: true,
        audit: auditResult,
        message: `Shell state audit complete for ${shell} with ${hardeningLevel} hardening`,
      });
    }

    // Return audit status
    return NextResponse.json({
      success: true,
      shell,
      hardeningLevel,
      message: `Shell audit API ready for ${shell} with ${hardeningLevel} hardening`,
    });
  } catch (error) {
    console.error('[Shell Audit Pixel Scan API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get shell audit',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Perform pixel scan or apply snap hardening
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'scan';
    const shell = (body.shell as 'shell' | 'cloud' | 'sandbox' | 'all') || 'all';
    const hardeningLevel = (body.hardeningLevel as 'snap' | 'hard' | 'full') || 'snap';

    if (action === 'applyHardening') {
      // Apply snap hardening shell protocol
      const hardening = applySnapHardeningShellProtocol(shell, hardeningLevel);
      return NextResponse.json({
        success: true,
        hardening,
        message: `Snap hardening shell protocol applied to ${shell} at ${hardeningLevel} level`,
      });
    }

    if (action === 'audit') {
      // Perform full state audit
      const depth = body.depth || 8;
      const auditResult = auditShellState(shell, hardeningLevel, depth);
      return NextResponse.json({
        success: true,
        audit: auditResult,
        message: `Shell state audit complete for ${shell}`,
      });
    }

    // Default: perform pixel scan
    const scanRequest: PixelScanRequest = {
      shell,
      region: body.region,
      depth: body.depth || 8,
      includeMetadata: body.includeMetadata ?? true,
      includeState: body.includeState ?? true,
      includeProtocols: body.includeProtocols ?? true,
      hardeningLevel,
    };

    let scanResult: PixelScanResult;

    if (scanRequest.region && (scanRequest.region.width > 1 || scanRequest.region.height > 1)) {
      // Region scan
      scanResult = scanRegion(scanRequest);
    } else {
      // Single pixel scan
      const pixelData = scanPixel(scanRequest);
      scanResult = {
        scanId: `pixel-scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
        shell,
        region: scanRequest.region || { x: 0, y: 0, width: 1, height: 1 },
        pixels: [pixelData],
        state: {
          confirmable: true,
          auditable: true,
          integrityHash: pixelData.state.integrityHash,
          hardeningLevel,
        },
        metadata: {
          totalPixels: 1,
          scannedPixels: 1,
          scanDuration: 0,
          recursiveDepth: scanRequest.depth || 8,
        },
      };
    }

    return NextResponse.json({
      success: true,
      scan: scanResult,
      message: `Pixel scan complete for ${shell} with ${hardeningLevel} hardening`,
    });
  } catch (error) {
    console.error('[Shell Audit Pixel Scan API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform pixel scan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
