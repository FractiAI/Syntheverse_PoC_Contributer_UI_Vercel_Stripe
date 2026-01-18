/**
 * NSPFRP-Compliant Agentic Memory System
 * 
 * Single source of truth for all internal memory access.
 * All memory operations must go through these utilities - no direct file access.
 * 
 * @module utils/agentic
 */

export {
  storeMemory,
  storeKnowledgeMemory,
  storeTeamMemory,
  type Memory,
  type SnapMetadata,
  type StoredMemory,
} from './memory-storage';

export {
  retrieveMemory,
  retrieveKnowledgeMemory,
  retrieveTeamMemory,
  listMemories,
  searchMemoriesByCategory,
} from './memory-retrieval';
