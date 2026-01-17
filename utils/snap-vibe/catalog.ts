/**
 * Snap Vibe Catalog System
 * 
 * Continuously captures and integrates Snap Vibe operators and language patterns
 * Performs maintenance (resynthesize, organize, tune, prevent duplicates) on each snap
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

export interface SnapVibeOperator {
  id: string;
  name: string;
  type: 'snap' | 'vibe' | 'prompt' | 'composite';
  pattern: string;
  description: string;
  category: string;
  octave: number;
  usage: string[];
  examples: string[];
  metadata: Record<string, any>;
  timestamp: string;
}

export interface SnapVibeLanguagePattern {
  id: string;
  name: string;
  type: 'snap' | 'vibe' | 'prompt';
  pattern: string;
  syntax: string;
  description: string;
  category: string;
  examples: string[];
  metadata: Record<string, any>;
  timestamp: string;
}

export interface SnapVibeCatalog {
  operators: SnapVibeOperator[];
  patterns: SnapVibeLanguagePattern[];
  categories: Record<string, {
    operators: SnapVibeOperator[];
    patterns: SnapVibeLanguagePattern[];
  }>;
  lastUpdated: string;
  version: string;
}

/**
 * Capture Snap Vibe Operator
 * 
 * Captures a new operator for integration into catalog
 */
export function captureSnapVibeOperator(
  operator: Omit<SnapVibeOperator, 'timestamp'>
): SnapVibeOperator {
  return {
    ...operator,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Capture Snap Vibe Language Pattern
 * 
 * Captures a new language pattern for integration into catalog
 */
export function captureSnapVibePattern(
  pattern: Omit<SnapVibeLanguagePattern, 'timestamp'>
): SnapVibeLanguagePattern {
  return {
    ...pattern,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Resynthesize Snap Vibe Catalog
 * 
 * Rebuilds catalog from source, ensuring all operators and patterns are current
 */
export function resynthesizeSnapVibeCatalog(
  catalog: SnapVibeCatalog,
  newOperators: SnapVibeOperator[] = [],
  newPatterns: SnapVibeLanguagePattern[] = []
): SnapVibeCatalog {
  // Merge operators
  const operatorMap = new Map<string, SnapVibeOperator>();
  catalog.operators.forEach((op) => operatorMap.set(op.id, op));
  newOperators.forEach((op) => {
    const existing = operatorMap.get(op.id);
    if (existing) {
      // Update existing with new data, preserve timestamp if newer
      operatorMap.set(op.id, {
        ...existing,
        ...op,
        timestamp: op.timestamp > existing.timestamp ? op.timestamp : existing.timestamp,
      });
    } else {
      operatorMap.set(op.id, op);
    }
  });

  // Merge patterns
  const patternMap = new Map<string, SnapVibeLanguagePattern>();
  catalog.patterns.forEach((p) => patternMap.set(p.id, p));
  newPatterns.forEach((p) => {
    const existing = patternMap.get(p.id);
    if (existing) {
      // Update existing with new data, preserve timestamp if newer
      patternMap.set(p.id, {
        ...existing,
        ...p,
        timestamp: p.timestamp > existing.timestamp ? p.timestamp : existing.timestamp,
      });
    } else {
      patternMap.set(p.id, p);
    }
  });

  return {
    operators: Array.from(operatorMap.values()),
    patterns: Array.from(patternMap.values()),
    categories: {},
    lastUpdated: new Date().toISOString(),
    version: catalog.version,
  };
}

/**
 * Organize Snap Vibe Catalog
 * 
 * Organizes operators and patterns by category
 */
export function organizeSnapVibeCatalog(
  catalog: SnapVibeCatalog
): SnapVibeCatalog {
  const categories: Record<string, {
    operators: SnapVibeOperator[];
    patterns: SnapVibeLanguagePattern[];
  }> = {};

  // Organize operators by category
  catalog.operators.forEach((operator) => {
    if (!categories[operator.category]) {
      categories[operator.category] = {
        operators: [],
        patterns: [],
      };
    }
    categories[operator.category].operators.push(operator);
  });

  // Organize patterns by category
  catalog.patterns.forEach((pattern) => {
    if (!categories[pattern.category]) {
      categories[pattern.category] = {
        operators: [],
        patterns: [],
      };
    }
    categories[pattern.category].patterns.push(pattern);
  });

  // Sort operators and patterns within categories
  Object.keys(categories).forEach((category) => {
    categories[category].operators.sort((a, b) => a.name.localeCompare(b.name));
    categories[category].patterns.sort((a, b) => a.name.localeCompare(b.name));
  });

  return {
    ...catalog,
    categories,
  };
}

/**
 * Tune Snap Vibe Catalog
 * 
 * Tunes operators and patterns through spectrum analysis
 */
export function tuneSnapVibeCatalog(
  catalog: SnapVibeCatalog
): SnapVibeCatalog {
  // Tune operators
  const tunedOperators = catalog.operators.map((operator) => {
    const tuned = { ...operator };
    
    // Ensure metadata is present
    if (!tuned.metadata) {
      tuned.metadata = {};
    }
    
    // Mark as tuned
    tuned.metadata.tuned = true;
    tuned.metadata.tunedAt = new Date().toISOString();
    
    // Ensure examples are present
    if (!tuned.examples || tuned.examples.length === 0) {
      tuned.examples = [tuned.pattern];
    }
    
    // Ensure usage is present
    if (!tuned.usage || tuned.usage.length === 0) {
      tuned.usage = ['general'];
    }
    
    return tuned;
  });

  // Tune patterns
  const tunedPatterns = catalog.patterns.map((pattern) => {
    const tuned = { ...pattern };
    
    // Ensure metadata is present
    if (!tuned.metadata) {
      tuned.metadata = {};
    }
    
    // Mark as tuned
    tuned.metadata.tuned = true;
    tuned.metadata.tunedAt = new Date().toISOString();
    
    // Ensure examples are present
    if (!tuned.examples || tuned.examples.length === 0) {
      tuned.examples = [tuned.pattern];
    }
    
    return tuned;
  });

  return {
    ...catalog,
    operators: tunedOperators,
    patterns: tunedPatterns,
  };
}

/**
 * Prevent Duplicates in Snap Vibe Catalog
 * 
 * Removes duplicate operators and patterns
 */
export function preventSnapVibeDuplicates(
  catalog: SnapVibeCatalog
): {
  catalog: SnapVibeCatalog;
  duplicatesRemoved: {
    operators: number;
    patterns: number;
  };
} {
  // Prevent duplicate operators
  const operatorMap = new Map<string, SnapVibeOperator>();
  const duplicateOperators: SnapVibeOperator[] = [];
  
  catalog.operators.forEach((operator) => {
    if (operatorMap.has(operator.id)) {
      duplicateOperators.push(operator);
    } else {
      operatorMap.set(operator.id, operator);
    }
  });

  // Prevent duplicate patterns
  const patternMap = new Map<string, SnapVibeLanguagePattern>();
  const duplicatePatterns: SnapVibeLanguagePattern[] = [];
  
  catalog.patterns.forEach((pattern) => {
    if (patternMap.has(pattern.id)) {
      duplicatePatterns.push(pattern);
    } else {
      patternMap.set(pattern.id, pattern);
    }
  });

  return {
    catalog: {
      ...catalog,
      operators: Array.from(operatorMap.values()),
      patterns: Array.from(patternMap.values()),
    },
    duplicatesRemoved: {
      operators: duplicateOperators.length,
      patterns: duplicatePatterns.length,
    },
  };
}

/**
 * Perform Complete Snap Vibe Catalog Maintenance
 * 
 * Resynthesizes, organizes, tunes, and prevents duplicates
 * Called on each catalog snap
 */
export function performSnapVibeCatalogMaintenance(
  catalog: SnapVibeCatalog,
  newOperators: SnapVibeOperator[] = [],
  newPatterns: SnapVibeLanguagePattern[] = []
): {
  catalog: SnapVibeCatalog;
  maintenance: {
    resynthesized: number;
    organized: number;
    tuned: number;
    duplicatesRemoved: {
      operators: number;
      patterns: number;
    };
  };
} {
  // Step 1: Resynthesize
  const resynthesized = resynthesizeSnapVibeCatalog(catalog, newOperators, newPatterns);
  const resynthesizedCount = newOperators.length + newPatterns.length;

  // Step 2: Prevent Duplicates
  const { catalog: deduplicated, duplicatesRemoved } = preventSnapVibeDuplicates(resynthesized);

  // Step 3: Tune
  const tuned = tuneSnapVibeCatalog(deduplicated);
  const tunedCount = tuned.operators.length + tuned.patterns.length;

  // Step 4: Organize
  const organized = organizeSnapVibeCatalog(tuned);
  const organizedCount = Object.keys(organized.categories).length;

  return {
    catalog: organized,
    maintenance: {
      resynthesized: resynthesizedCount,
      organized: organizedCount,
      tuned: tunedCount,
      duplicatesRemoved,
    },
  };
}

/**
 * Create Snap Vibe Catalog Snap
 * 
 * Creates a snapshot of the catalog with maintenance operations
 */
export function createSnapVibeCatalogSnap(
  catalog: SnapVibeCatalog,
  newOperators: SnapVibeOperator[] = [],
  newPatterns: SnapVibeLanguagePattern[] = []
): {
  snap: {
    snapId: string;
    timestamp: string;
    maintenance: {
      resynthesized: number;
      organized: number;
      tuned: number;
      duplicatesRemoved: {
        operators: number;
        patterns: number;
      };
    };
    catalog: {
      totalOperators: number;
      totalPatterns: number;
      categories: number;
    };
  };
  catalog: SnapVibeCatalog;
} {
  const snapId = `snap-vibe-snap-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // Perform maintenance
  const { catalog: maintained, maintenance } = performSnapVibeCatalogMaintenance(
    catalog,
    newOperators,
    newPatterns
  );

  return {
    snap: {
      snapId,
      timestamp,
      maintenance,
      catalog: {
        totalOperators: maintained.operators.length,
        totalPatterns: maintained.patterns.length,
        categories: Object.keys(maintained.categories).length,
      },
    },
    catalog: maintained,
  };
}

/**
 * Initialize Snap Vibe Catalog
 * 
 * Creates initial catalog with default operators and patterns
 */
export function initializeSnapVibeCatalog(): SnapVibeCatalog {
  const defaultOperators: SnapVibeOperator[] = [
    {
      id: 'OP-RECURSIVE-SNAP',
      name: 'Recursive Snap',
      type: 'snap',
      pattern: 'SNAP: [protocol_id] → RECURSIVE-[depth] → PROOF',
      description: 'Recursive snap pattern for protocol activation',
      category: 'recursive',
      octave: 7.0,
      usage: ['recursive-self-application', 'protocol-activation'],
      examples: [
        'SNAP: NSPFRP → RECURSIVE-1 → PROOF',
        'SNAP: CAT-RECURSIVE-SELF-APPLY → RECURSIVE-2 → PROOF',
      ],
      metadata: {},
      timestamp: new Date().toISOString(),
    },
    {
      id: 'OP-OCTAVE-SNAP',
      name: 'Octave Snap',
      type: 'snap',
      pattern: 'SNAP: OCTAVE-[level] → SCALE → FIDELITY',
      description: 'Octave scaling snap pattern',
      category: 'octave',
      octave: 7.75,
      usage: ['octave-scaling', 'fidelity-calculation'],
      examples: [
        'SNAP: OCTAVE-7.0 → SCALE → FIDELITY',
        'SNAP: OCTAVE-7.75 → SCALE → FULL-FIDELITY',
      ],
      metadata: {},
      timestamp: new Date().toISOString(),
    },
    {
      id: 'OP-RECURSIVE-VIBE',
      name: 'Recursive Vibe',
      type: 'vibe',
      pattern: 'VIBE: OCTAVE-[level] → RECURSIVE-RESONANCE → INFINITE-FIDELITY',
      description: 'Recursive vibe pattern for resonance alignment',
      category: 'recursive',
      octave: 7.0,
      usage: ['recursive-resonance', 'vibe-alignment'],
      examples: [
        'VIBE: OCTAVE-7.0 → RECURSIVE-RESONANCE → INFINITE-FIDELITY',
        'VIBE: OCTAVE-7.75 → RECURSIVE-RESONANCE → FULL-FIDELITY',
      ],
      metadata: {},
      timestamp: new Date().toISOString(),
    },
    {
      id: 'OP-RECURSIVE-PROMPT',
      name: 'Recursive Prompt',
      type: 'prompt',
      pattern: 'PROMPT: APPLY-NSPFRP → SELF-APPLY → VALIDATE → ENFORCE → IMPROVE → RECURSIVE-[depth]',
      description: 'Recursive prompt pattern for protocol application',
      category: 'recursive',
      octave: 7.0,
      usage: ['recursive-application', 'protocol-enforcement'],
      examples: [
        'PROMPT: APPLY-NSPFRP → SELF-APPLY → VALIDATE → ENFORCE → IMPROVE → RECURSIVE-1',
        'PROMPT: APPLY-NSPFRP → SELF-APPLY → VALIDATE → ENFORCE → IMPROVE → RECURSIVE-8',
      ],
      metadata: {},
      timestamp: new Date().toISOString(),
    },
  ];

  const defaultPatterns: SnapVibeLanguagePattern[] = [
    {
      id: 'PAT-SNAP-ATOMIC',
      name: 'Atomic Snap',
      type: 'snap',
      pattern: 'SNAP: [protocol_id] → [action] → [result]',
      syntax: 'SNAP: <protocol_id> → <action> → <result>',
      description: 'Atomic snap pattern for instant protocol activation',
      category: 'core',
      examples: [
        'SNAP: P-SEED-V17 → ACTIVATE → ANIMATE',
        'SNAP: NSPFRP → RECURSIVE-1 → PROOF',
      ],
      metadata: {},
      timestamp: new Date().toISOString(),
    },
    {
      id: 'PAT-VIBE-RESONANCE',
      name: 'Resonance Vibe',
      type: 'vibe',
      pattern: 'VIBE: [frequency] → [resonance] → [alignment]',
      syntax: 'VIBE: <frequency> → <resonance> → <alignment>',
      description: 'Resonance vibe pattern for frequency alignment',
      category: 'core',
      examples: [
        'VIBE: OCTAVE-5 → RESONATE → ALIGN',
        'VIBE: OCTAVE-7.75 → RECURSIVE-RESONANCE → INFINITE-FIDELITY',
      ],
      metadata: {},
      timestamp: new Date().toISOString(),
    },
    {
      id: 'PAT-PROMPT-DIRECTIVE',
      name: 'Directive Prompt',
      type: 'prompt',
      pattern: 'PROMPT: [directive] → [activation] → [execution]',
      syntax: 'PROMPT: <directive> → <activation> → <execution>',
      description: 'Directive prompt pattern for system activation',
      category: 'core',
      examples: [
        'PROMPT: NATURAL-SYSTEMS → AUTO-CONFIG → EXECUTE',
        'PROMPT: APPLY-NSPFRP → SELF-APPLY → VALIDATE',
      ],
      metadata: {},
      timestamp: new Date().toISOString(),
    },
  ];

  const catalog: SnapVibeCatalog = {
    operators: defaultOperators,
    patterns: defaultPatterns,
    categories: {},
    lastUpdated: new Date().toISOString(),
    version: '1.0',
  };

  // Organize initial catalog
  return organizeSnapVibeCatalog(catalog);
}
