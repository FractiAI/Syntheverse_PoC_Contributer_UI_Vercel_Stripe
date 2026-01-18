/**
 * NSPFRP-Compliant Local Memory Storage System
 * 
 * Single Source of Truth for all internal memory within repository.
 * Follows NSPFRP principles: no duplication, centralized storage, type-safe access.
 * 
 * @module utils/agentic/memory-storage
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MEMORY_DIR = '.agentic-memory';

export interface Memory {
  id: string;
  type: 'session' | 'context' | 'knowledge';
  content: any;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    source: string;
    fidelity?: number;
  };
}

export interface SnapMetadata {
  category: string;
  version: string;
  fidelity: number;
}

export interface StoredMemory {
  memory: Memory;
  snap: SnapMetadata;
}

/**
 * Store memory in NSPFRP-compliant format
 * 
 * Single source of truth - all memory stored here, no duplication allowed.
 */
export async function storeMemory(
  memory: Memory,
  snap: SnapMetadata
): Promise<void> {
  const dir = join(MEMORY_DIR, memory.type);
  
  // Ensure directory exists
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  
  const filepath = join(dir, `${memory.id}.json`);
  const stored: StoredMemory = {
    memory: {
      ...memory,
      metadata: {
        ...memory.metadata,
        updatedAt: new Date().toISOString(),
      },
    },
    snap,
  };
  
  const content = JSON.stringify(stored, null, 2);
  await writeFile(filepath, content, 'utf-8');
}

/**
 * Store knowledge memory (team info, protocols, features)
 */
export async function storeKnowledgeMemory(
  knowledgeId: string,
  title: string,
  content: any,
  category: string,
  relations?: {
    protocols?: string[];
    features?: string[];
    dependencies?: string[];
  }
): Promise<void> {
  const memory: Memory = {
    id: knowledgeId,
    type: 'knowledge',
    content: {
      title,
      content,
      relations: relations || {},
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      source: 'internal',
      fidelity: 1.0,
    },
  };
  
  const snap: SnapMetadata = {
    category,
    version: '2025-01',
    fidelity: 1.0,
  };
  
  await storeMemory(memory, snap);
}

/**
 * Store team information (NSPFRP single source of truth)
 */
export async function storeTeamMemory(teamData: any): Promise<void> {
  await storeKnowledgeMemory(
    'fractiai-research-team',
    'FractiAI Research Team - Complete Roster',
    teamData,
    'Team Architecture',
    {
      protocols: ['NSPFRP', 'THALET'],
      features: ['Hero Hosts', 'Team Architecture'],
    }
  );
}
