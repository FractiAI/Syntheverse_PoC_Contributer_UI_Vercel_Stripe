/**
 * TSRC Archive Snapshot System
 * Content-addressed, immutable snapshots for deterministic evaluation
 * 
 * Key principle: Archive snapshots are hashed and immutable once created.
 * This ensures that evaluations can be reproduced exactly.
 */

import crypto from 'crypto';
import { debug, debugError } from '@/utils/debug';
import type { ArchiveSnapshot } from './types';

/**
 * Create a content-addressed snapshot of the current archive state
 * 
 * @param contributions Array of contribution hashes to include
 * @param sandboxId Sandbox ID (null for main Syntheverse)
 * @param embeddingModel Embedding model configuration
 * @param indexingParams Indexing parameters
 * @param metadata Optional metadata for audit trail
 * @returns Immutable snapshot with content-addressed ID
 */
export function createArchiveSnapshot(
  contributions: string[],
  sandboxId: string | null,
  embeddingModel: {
    name: string;
    version: string;
    provider: string;
  },
  indexingParams: {
    method: string;
    dimensions: number;
    normalization: string;
  },
  metadata?: {
    created_by?: string;
    purpose?: string;
    notes?: string;
  }
): ArchiveSnapshot {
  const timestamp = new Date().toISOString();
  
  // Sort contributions for deterministic hashing
  const sortedContributions = [...contributions].sort();
  
  // Create canonical representation for hashing
  const canonicalData = {
    sandbox_id: sandboxId,
    contributions: sortedContributions,
    embedding_model: embeddingModel,
    indexing_params: indexingParams,
    created_at: timestamp,
  };
  
  // Compute content-addressed hash (SHA-256)
  const canonicalString = JSON.stringify(canonicalData);
  const snapshotHash = crypto
    .createHash('sha256')
    .update(canonicalString)
    .digest('hex');
  
  const snapshot: ArchiveSnapshot = {
    snapshot_id: snapshotHash,
    created_at: timestamp,
    sandbox_id: sandboxId,
    contribution_hashes: sortedContributions,
    embedding_model: embeddingModel,
    indexing_params: indexingParams,
    item_count: sortedContributions.length,
    metadata: metadata || {},
  };
  
  debug('TSRC:Snapshot', 'Created archive snapshot', {
    snapshot_id: snapshotHash,
    item_count: sortedContributions.length,
    sandbox_id: sandboxId,
  });
  
  return snapshot;
}

/**
 * Verify snapshot integrity by recomputing its hash
 * 
 * @param snapshot Snapshot to verify
 * @returns True if snapshot hash matches its content
 */
export function verifySnapshotIntegrity(snapshot: ArchiveSnapshot): boolean {
  try {
    // Sort contributions for deterministic hashing
    const sortedContributions = [...snapshot.contribution_hashes].sort();
    
    // Recreate canonical representation
    const canonicalData = {
      sandbox_id: snapshot.sandbox_id,
      contributions: sortedContributions,
      embedding_model: snapshot.embedding_model,
      indexing_params: snapshot.indexing_params,
      created_at: snapshot.created_at,
    };
    
    const canonicalString = JSON.stringify(canonicalData);
    const recomputedHash = crypto
      .createHash('sha256')
      .update(canonicalString)
      .digest('hex');
    
    const isValid = recomputedHash === snapshot.snapshot_id;
    
    if (!isValid) {
      debugError('TSRC:Snapshot', 'Snapshot integrity check failed', {
        snapshot_id: snapshot.snapshot_id,
        recomputed_hash: recomputedHash,
      });
    }
    
    return isValid;
  } catch (error) {
    debugError('TSRC:Snapshot', 'Error verifying snapshot integrity', error);
    return false;
  }
}

/**
 * Check if a contribution is included in a snapshot
 * 
 * @param snapshot Snapshot to check
 * @param contributionHash Hash of the contribution
 * @returns True if contribution is in snapshot
 */
export function isContributionInSnapshot(
  snapshot: ArchiveSnapshot,
  contributionHash: string
): boolean {
  return snapshot.contribution_hashes.includes(contributionHash);
}

/**
 * Compare two snapshots to determine if they're identical
 * 
 * @param snapshot1 First snapshot
 * @param snapshot2 Second snapshot
 * @returns True if snapshots are identical
 */
export function compareSnapshots(
  snapshot1: ArchiveSnapshot,
  snapshot2: ArchiveSnapshot
): boolean {
  // Content-addressed snapshots are identical if their IDs match
  return snapshot1.snapshot_id === snapshot2.snapshot_id;
}

/**
 * Get snapshot diff: contributions added/removed between two snapshots
 * 
 * @param oldSnapshot Previous snapshot
 * @param newSnapshot Current snapshot
 * @returns Diff showing added and removed contributions
 */
export function getSnapshotDiff(
  oldSnapshot: ArchiveSnapshot,
  newSnapshot: ArchiveSnapshot
): {
  added: string[];
  removed: string[];
  unchanged: string[];
  delta_count: number;
} {
  const oldSet = new Set(oldSnapshot.contribution_hashes);
  const newSet = new Set(newSnapshot.contribution_hashes);
  
  const added = newSnapshot.contribution_hashes.filter(hash => !oldSet.has(hash));
  const removed = oldSnapshot.contribution_hashes.filter(hash => !newSet.has(hash));
  const unchanged = oldSnapshot.contribution_hashes.filter(hash => newSet.has(hash));
  
  return {
    added,
    removed,
    unchanged,
    delta_count: added.length + removed.length,
  };
}

/**
 * Create a snapshot from current database state
 * This is a helper that would integrate with the actual database
 * 
 * @param db Database connection
 * @param sandboxId Sandbox ID (null for main Syntheverse)
 * @returns Promise resolving to snapshot
 */
export async function createSnapshotFromDB(
  db: any, // Your database client
  sandboxId: string | null = null
): Promise<ArchiveSnapshot> {
  try {
    // This would fetch actual contribution hashes from the database
    // For now, returning a placeholder that shows the pattern
    
    debug('TSRC:Snapshot', 'Creating snapshot from database', { sandboxId });
    
    // Fetch contribution hashes (implementation depends on your DB schema)
    const contributions: string[] = []; // Would be populated from DB query
    
    const snapshot = createArchiveSnapshot(
      contributions,
      sandboxId,
      {
        name: 'text-embedding-3-small',
        version: '1.0',
        provider: 'openai',
      },
      {
        method: 'cosine_similarity',
        dimensions: 1536,
        normalization: 'l2',
      },
      {
        purpose: 'evaluation',
        notes: 'Auto-generated snapshot for deterministic evaluation',
      }
    );
    
    return snapshot;
  } catch (error) {
    debugError('TSRC:Snapshot', 'Failed to create snapshot from DB', error);
    throw error;
  }
}

