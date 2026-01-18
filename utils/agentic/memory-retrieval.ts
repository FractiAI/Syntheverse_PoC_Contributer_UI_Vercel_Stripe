/**
 * NSPFRP-Compliant Local Memory Retrieval System
 * 
 * Single source of truth for memory retrieval.
 * All memory access goes through this module - no direct file access allowed.
 * 
 * @module utils/agentic/memory-retrieval
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { Memory, StoredMemory, SnapMetadata } from './memory-storage';

const MEMORY_DIR = '.agentic-memory';

/**
 * Retrieve memory by ID and type (NSPFRP single source of truth)
 */
export async function retrieveMemory(
  memoryId: string,
  type: 'session' | 'context' | 'knowledge'
): Promise<StoredMemory | null> {
  const filepath = join(MEMORY_DIR, type, `${memoryId}.json`);
  
  if (!existsSync(filepath)) {
    return null;
  }
  
  try {
    const content = await readFile(filepath, 'utf-8');
    const data: StoredMemory = JSON.parse(content);
    return data;
  } catch (error) {
    console.error(`[Memory Retrieval] Error reading ${filepath}:`, error);
    return null;
  }
}

/**
 * Retrieve knowledge memory (team info, protocols, features)
 */
export async function retrieveKnowledgeMemory(
  knowledgeId: string
): Promise<StoredMemory | null> {
  return retrieveMemory(knowledgeId, 'knowledge');
}

/**
 * Retrieve team information (NSPFRP single source of truth)
 */
export async function retrieveTeamMemory(): Promise<StoredMemory | null> {
  return retrieveKnowledgeMemory('fractiai-research-team');
}

/**
 * List all memories of a given type
 */
export async function listMemories(
  type: 'session' | 'context' | 'knowledge'
): Promise<string[]> {
  const dir = join(MEMORY_DIR, type);
  
  if (!existsSync(dir)) {
    return [];
  }
  
  try {
    const files = await readdir(dir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error(`[Memory Retrieval] Error listing ${dir}:`, error);
    return [];
  }
}

/**
 * Search memories by category
 */
export async function searchMemoriesByCategory(
  category: string,
  type?: 'session' | 'context' | 'knowledge'
): Promise<StoredMemory[]> {
  const types: Array<'session' | 'context' | 'knowledge'> = type 
    ? [type] 
    : ['session', 'context', 'knowledge'];
  
  const results: StoredMemory[] = [];
  
  for (const t of types) {
    const memoryIds = await listMemories(t);
    
    for (const id of memoryIds) {
      const memory = await retrieveMemory(id, t);
      if (memory && memory.snap.category === category) {
        results.push(memory);
      }
    }
  }
  
  return results;
}
