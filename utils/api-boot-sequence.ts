/**
 * API Boot Sequence Hook
 * 
 * Runs catalog version check on API route initialization
 * For use in API routes that need catalog version verification
 */

import { quickBootCheck } from './boot-sequence';
import type { NextRequest } from 'next/server';

export interface APIBootSequenceResult {
  catalogVersion: {
    checked: boolean;
    currentVersion: string;
    latestVersion: string;
    isUpToDate: boolean;
    source: string;
    timestamp: string;
  };
  ready: boolean;
}

/**
 * Run boot sequence for API route
 * Called at connection/initialization time for new API nodes
 * 
 * @param request - NextRequest object (optional, for metadata)
 * @param source - Catalog version source ('github' | 'local' | 'auto')
 * @param currentVersion - Current catalog version
 */
export async function runAPIBootSequence(
  request?: NextRequest,
  source: 'github' | 'local' | 'auto' = 'auto',
  currentVersion: string = 'v17.0'
): Promise<APIBootSequenceResult> {
  try {
    const catalogCheck = await quickBootCheck(source, currentVersion);

    return {
      catalogVersion: {
        checked: catalogCheck.success,
        currentVersion: catalogCheck.currentVersion,
        latestVersion: catalogCheck.latestVersion,
        isUpToDate: catalogCheck.upToDate,
        source: catalogCheck.source,
        timestamp: catalogCheck.timestamp,
      },
      ready: catalogCheck.success && catalogCheck.upToDate,
    };
  } catch (error) {
    console.error('[API Boot Sequence] Error:', error);
    return {
      catalogVersion: {
        checked: false,
        currentVersion,
        latestVersion: currentVersion,
        isUpToDate: true,
        source: 'error',
        timestamp: new Date().toISOString(),
      },
      ready: true, // Don't block on error
    };
  }
}

/**
 * Run boot sequence for chat connection
 * Called when new chat/node connects
 * 
 * @param nodeId - Unique identifier for the chat node
 * @param source - Catalog version source
 * @param currentVersion - Current catalog version
 */
export async function runChatBootSequence(
  nodeId: string,
  source: 'github' | 'local' | 'auto' = 'auto',
  currentVersion: string = 'v17.0'
): Promise<APIBootSequenceResult> {
  try {
    const catalogCheck = await quickBootCheck(source, currentVersion);

    // Optionally create snapshot
    // const snapshot = createOnboardingSnapshot('chat', nodeId, versionCheck, { connectionType: 'chat' });

    return {
      catalogVersion: {
        checked: catalogCheck.success,
        currentVersion: catalogCheck.currentVersion,
        latestVersion: catalogCheck.latestVersion,
        isUpToDate: catalogCheck.upToDate,
        source: catalogCheck.source,
        timestamp: catalogCheck.timestamp,
      },
      ready: catalogCheck.success && catalogCheck.upToDate,
    };
  } catch (error) {
    console.error('[Chat Boot Sequence] Error:', error);
    return {
      catalogVersion: {
        checked: false,
        currentVersion,
        latestVersion: currentVersion,
        isUpToDate: true,
        source: 'error',
        timestamp: new Date().toISOString(),
      },
      ready: true, // Don't block on error
    };
  }
}
