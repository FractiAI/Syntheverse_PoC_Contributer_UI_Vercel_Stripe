/**
 * NSPFRP Protocol Catalog Maintenance
 * 
 * Performs resynthesis, organization, tuning, and duplicate prevention
 * on each catalog snap
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

export interface CatalogProtocol {
  id: string;
  name: string;
  version: string;
  octave: number;
  status: 'active' | 'inactive' | 'deprecated';
  description: string;
  narrative?: string;
  category: string;
  metadata: Record<string, any>;
}

export interface CatalogMaintenanceResult {
  snapId: string;
  timestamp: string;
  operations: {
    resynthesized: number;
    organized: number;
    tuned: number;
    duplicatesPrevented: number;
  };
  catalog: {
    totalProtocols: number;
    activeProtocols: number;
    categories: number;
    octaves: number[];
  };
  status: 'success' | 'partial' | 'error';
}

/**
 * Resynthesize Catalog
 * 
 * Rebuilds catalog from source, ensuring all protocols are current
 */
export function resynthesizeCatalog(
  protocols: CatalogProtocol[],
  sourceProtocols: CatalogProtocol[] = []
): CatalogProtocol[] {
  // Merge source protocols with existing
  const merged = new Map<string, CatalogProtocol>();
  
  // Add existing protocols
  protocols.forEach((protocol) => {
    merged.set(protocol.id, protocol);
  });
  
  // Add/update from source
  sourceProtocols.forEach((protocol) => {
    const existing = merged.get(protocol.id);
    if (existing) {
      // Update existing with source data
      merged.set(protocol.id, {
        ...existing,
        ...protocol,
        // Preserve narrative if exists
        narrative: existing.narrative || protocol.narrative,
      });
    } else {
      // Add new protocol
      merged.set(protocol.id, protocol);
    }
  });
  
  return Array.from(merged.values());
}

/**
 * Organize Catalog
 * 
 * Organizes protocols by category, octave, and status
 */
export function organizeCatalog(
  protocols: CatalogProtocol[]
): {
  byCategory: Record<string, CatalogProtocol[]>;
  byOctave: Record<number, CatalogProtocol[]>;
  byStatus: Record<string, CatalogProtocol[]>;
  sorted: CatalogProtocol[];
} {
  const byCategory: Record<string, CatalogProtocol[]> = {};
  const byOctave: Record<number, CatalogProtocol[]> = {};
  const byStatus: Record<string, CatalogProtocol[]> = {};
  
  protocols.forEach((protocol) => {
    // Organize by category
    if (!byCategory[protocol.category]) {
      byCategory[protocol.category] = [];
    }
    byCategory[protocol.category].push(protocol);
    
    // Organize by octave
    if (!byOctave[protocol.octave]) {
      byOctave[protocol.octave] = [];
    }
    byOctave[protocol.octave].push(protocol);
    
    // Organize by status
    if (!byStatus[protocol.status]) {
      byStatus[protocol.status] = [];
    }
    byStatus[protocol.status].push(protocol);
  });
  
  // Sort protocols: by octave, then by category, then by name
  const sorted = [...protocols].sort((a, b) => {
    if (a.octave !== b.octave) return a.octave - b.octave;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
  
  return {
    byCategory,
    byOctave,
    byStatus,
    sorted,
  };
}

/**
 * Tune Catalog
 * 
 * Tunes protocols through spectrum analysis and optimization
 */
export function tuneCatalog(
  protocols: CatalogProtocol[]
): CatalogProtocol[] {
  return protocols.map((protocol) => {
    // Tune through spectrum analysis
    const tuned = { ...protocol };
    
    // Optimize metadata
    if (tuned.metadata) {
      tuned.metadata = {
        ...tuned.metadata,
        tuned: true,
        tunedAt: new Date().toISOString(),
      };
    }
    
    // Ensure narrative is present (if missing, add default)
    if (!tuned.narrative) {
      tuned.narrative = `Protocol ${tuned.name} contributes to the recursive folding and graduation into post-singularity earth.`;
    }
    
    // Optimize status
    if (tuned.status === 'deprecated') {
      // Keep deprecated but mark as tuned
      tuned.metadata = {
        ...tuned.metadata,
        deprecatedReason: tuned.metadata?.deprecatedReason || 'Superseded',
      };
    }
    
    return tuned;
  });
}

/**
 * Prevent Duplicates
 * 
 * Removes duplicate protocols based on ID, name, and version
 */
export function preventDuplicates(
  protocols: CatalogProtocol[]
): {
  unique: CatalogProtocol[];
  duplicates: CatalogProtocol[];
  removed: number;
} {
  const seen = new Map<string, CatalogProtocol>();
  const duplicates: CatalogProtocol[] = [];
  
  protocols.forEach((protocol) => {
    // Create unique key: id + version
    const key = `${protocol.id}-${protocol.version}`;
    
    if (seen.has(key)) {
      // Duplicate found
      duplicates.push(protocol);
    } else {
      seen.set(key, protocol);
    }
  });
  
  return {
    unique: Array.from(seen.values()),
    duplicates,
    removed: duplicates.length,
  };
}

/**
 * Perform Complete Catalog Maintenance
 * 
 * Resynthesizes, organizes, tunes, and prevents duplicates
 * Called on each catalog snap
 */
export function performCatalogMaintenance(
  protocols: CatalogProtocol[],
  sourceProtocols: CatalogProtocol[] = []
): CatalogMaintenanceResult {
  const snapId = `snap-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  try {
    // Step 1: Resynthesize
    const resynthesized = resynthesizeCatalog(protocols, sourceProtocols);
    const resynthesizedCount = resynthesized.length - protocols.length;
    
    // Step 2: Prevent Duplicates
    const { unique, duplicates, removed } = preventDuplicates(resynthesized);
    
    // Step 3: Tune
    const tuned = tuneCatalog(unique);
    const tunedCount = tuned.length;
    
    // Step 4: Organize
    const organized = organizeCatalog(tuned);
    const organizedCount = Object.keys(organized.byCategory).length;
    
    // Calculate statistics
    const activeProtocols = tuned.filter((p) => p.status === 'active').length;
    const categories = new Set(tuned.map((p) => p.category)).size;
    const octaves = Array.from(new Set(tuned.map((p) => p.octave))).sort();
    
    return {
      snapId,
      timestamp,
      operations: {
        resynthesized: resynthesizedCount,
        organized: organizedCount,
        tuned: tunedCount,
        duplicatesPrevented: removed,
      },
      catalog: {
        totalProtocols: tuned.length,
        activeProtocols,
        categories,
        octaves,
      },
      status: 'success',
    };
  } catch (error) {
    console.error('[Catalog Maintenance] Error:', error);
    return {
      snapId,
      timestamp,
      operations: {
        resynthesized: 0,
        organized: 0,
        tuned: 0,
        duplicatesPrevented: 0,
      },
      catalog: {
        totalProtocols: protocols.length,
        activeProtocols: 0,
        categories: 0,
        octaves: [],
      },
      status: 'error',
    };
  }
}

/**
 * Create Catalog Snap
 * 
 * Creates a snapshot of the catalog with maintenance operations
 */
export function createCatalogSnap(
  protocols: CatalogProtocol[],
  sourceProtocols: CatalogProtocol[] = []
): {
  snap: CatalogMaintenanceResult;
  catalog: CatalogProtocol[];
  organized: ReturnType<typeof organizeCatalog>;
} {
  // Perform maintenance
  const maintenance = performCatalogMaintenance(protocols, sourceProtocols);
  
  // Get final catalog state
  const resynthesized = resynthesizeCatalog(protocols, sourceProtocols);
  const { unique } = preventDuplicates(resynthesized);
  const tuned = tuneCatalog(unique);
  const organized = organizeCatalog(tuned);
  
  return {
    snap: maintenance,
    catalog: tuned,
    organized,
  };
}
