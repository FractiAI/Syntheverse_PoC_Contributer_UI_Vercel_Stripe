/**
 * TSRC (Trinary Self-Regulating Core) - Main Export
 * 
 * Implements TSRC principles for deterministic, auditable evaluation
 * Based on feedback from Marek and Simba
 * 
 * Includes BøwTæCøre Gate Model (-1 → 0a → 0b → +1)
 */

// Types
export * from './types';

// Snapshot System
export * from './snapshot';

// Operator Hygiene
export * from './operators';

// Stability Monitoring
export * from './stability';

// BøwTæCøre Gate Model (Phases 2-5)
export * from './evaluate-pure';  // Phase 2: Layer -1 (pure evaluation)
export * from './projector';      // Phase 3: Layer 0a (PFO projector)
export * from './authorizer';     // Phase 4: Layer 0b (minimal authorizer)
export * from './executor';       // Phase 5: Layer +1 (fail-closed executor)

