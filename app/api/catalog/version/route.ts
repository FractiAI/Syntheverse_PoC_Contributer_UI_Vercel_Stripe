/**
 * NSPFRP Protocol Catalog Version Check API
 * 
 * GET /api/catalog/version
 * 
 * Checks latest catalog version from selectable source (default: GitHub)
 * Used in boot sequence for new nodes (chats, API calls, onboarding)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCatalogVersion, createOnboardingSnapshot } from '@/utils/catalog-version-checker';
import { performCatalogMaintenance } from '@/utils/catalog/maintenance';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface VersionCheckParams {
  source?: 'github' | 'local' | 'auto';
  currentVersion?: string;
  createSnapshot?: boolean;
  nodeType?: 'chat' | 'api' | 'session' | 'onboarding';
  nodeId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from query string
    const source = (searchParams.get('source') as 'github' | 'local' | 'auto') || 'auto';
    const currentVersion = searchParams.get('currentVersion') || 'v17.0';
    const createSnapshotParam = searchParams.get('createSnapshot') === 'true';
    const nodeType = (searchParams.get('nodeType') as 'chat' | 'api' | 'session' | 'onboarding') || 'api';
    const nodeId = searchParams.get('nodeId') || `node-${Date.now()}`;

    // Check catalog version
    const versionCheck = await checkCatalogVersion(source, currentVersion);

    let snapshot = null;
    if (createSnapshotParam) {
      // Get metadata from request
      const metadata = {
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        connectionType: 'api',
        endpoint: request.url,
      };

      snapshot = createOnboardingSnapshot(nodeType, nodeId, versionCheck, metadata);

      // Optionally store snapshot in database (if needed)
      // For now, just return it in the response
    }

    return NextResponse.json({
      success: true,
      versionCheck,
      snapshot,
      message: versionCheck.isUpToDate
        ? 'Catalog version is up to date'
        : `Catalog update available: ${versionCheck.latestVersion}`,
    });
  } catch (error) {
    console.error('[Catalog Version API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check catalog version',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/catalog/version
 * 
 * Create onboarding snapshot with version check
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const source: 'github' | 'local' | 'auto' = body.source || 'auto';
    const currentVersion: string = body.currentVersion || 'v17.0';
    const nodeType: 'chat' | 'api' | 'session' | 'onboarding' = body.nodeType || 'api';
    const nodeId: string = body.nodeId || `node-${Date.now()}`;
    const metadata: Record<string, any> = body.metadata || {};

    // Check catalog version
    const versionCheck = await checkCatalogVersion(source, currentVersion);

    // Perform catalog maintenance (resynthesize, organize, tune, prevent duplicates)
    // This happens on each snap
    const maintenance = performCatalogMaintenance([], []); // Empty arrays for now, will be populated from actual catalog

    // Add request metadata
    const requestMetadata = {
      ...metadata,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      connectionType: 'api',
      endpoint: request.url,
      method: 'POST',
      catalogMaintenance: {
        resynthesized: maintenance.operations.resynthesized > 0,
        organized: maintenance.operations.organized > 0,
        tuned: maintenance.operations.tuned > 0,
        duplicatesPrevented: maintenance.operations.duplicatesPrevented > 0,
      },
    };

    // Create onboarding snapshot
    const snapshot = createOnboardingSnapshot(nodeType, nodeId, versionCheck, requestMetadata);

    // Optionally store in database
    // For now, just return it

    return NextResponse.json({
      success: true,
      snapshot,
      versionCheck,
      maintenance,
      message: 'Onboarding snapshot created with catalog maintenance',
    });
  } catch (error) {
    console.error('[Catalog Version API] Error creating snapshot:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create snapshot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
