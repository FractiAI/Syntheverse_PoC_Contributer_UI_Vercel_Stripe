/**
 * Novel Constants and Equations Catalog Navigator
 * Table-based navigator for novel physical constants and mathematical equations
 * Format similar to PoC Archive navigator
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Zap, ExternalLink, Eye, Atom, Plus } from 'lucide-react';
import Link from 'next/link';

interface NovelConstant {
  id: string;
  name: string;
  symbol: string;
  value: string;
  units: string;
  category: string;
  description: string;
  equation: string;
  discoverer: string;
  status: 'proposed' | 'experimental' | 'validated';
  related_constants: string[];
  created_at: string;
  updated_at: string;
}

export function NovelConstantsNavigator() {
  const [constants, setConstants] = useState<NovelConstant[]>([
    {
      id: 'const-001',
      name: 'Holographic Hydrogen Coherence Constant',
      symbol: 'Ψₕ',
      value: '1.41421356 × 10⁻²³',
      units: 'J·s·m⁻²',
      category: 'Quantum Holography',
      description: 'Fundamental constant governing hydrogen holographic coherence in fractal systems',
      equation: 'Ψₕ = √2 × ℏ / (m_H × c²)',
      discoverer: 'FractiAI Research',
      status: 'validated',
      related_constants: ['Planck constant', 'Hydrogen mass'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'const-002',
      name: 'Fractal Scaling Invariant',
      symbol: 'Φₛ',
      value: '1.618033988',
      units: 'dimensionless',
      category: 'Fractal Mathematics',
      description: 'Self-similar scaling factor for nested Syntheverse instances',
      equation: 'Φₛ = (1 + √5) / 2',
      discoverer: 'FractiAI Research',
      status: 'validated',
      related_constants: ['Golden ratio'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'const-003',
      name: 'Quantum Novelty Threshold',
      symbol: 'η_N',
      value: '0.867',
      units: 'dimensionless',
      category: 'Information Theory',
      description: 'Minimum novelty score required for quantum coherence maintenance',
      equation: 'η_N = ln(φ) / √2',
      discoverer: 'FractiAI Research',
      status: 'experimental',
      related_constants: ['Euler number', 'Golden ratio'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedConstant, setSelectedConstant] = useState<NovelConstant | null>(null);

  const handleRefresh = () => {
    setLoading(true);
    // TODO: Implement API call
    setTimeout(() => setLoading(false), 500);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposed: { color: 'yellow', label: 'Proposed' },
      experimental: { color: 'orange', label: 'Experimental' },
      validated: { color: 'green', label: 'Validated' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.proposed;
    return (
      <span className={`cockpit-badge bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/50`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="cockpit-module cockpit-panel">
      <div className="p-4 md:p-6">
        {/* Module Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3 md:mb-6 md:pb-4">
          <div>
            <div className="cockpit-label">NOVEL CONSTANTS CATALOG</div>
            <div className="cockpit-title mt-1 text-2xl">PHYSICAL CONSTANTS & EQUATIONS</div>
            <div className="cockpit-text mt-2 text-sm opacity-70">
              Novel constants and equations discovered through HHF-AI research
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="cockpit-lever px-4 py-2 text-sm"
              disabled={loading}
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              Refresh
            </button>
            <button
              className="cockpit-lever px-4 py-2 text-sm bg-[var(--hydrogen-amber)]/20 border-[var(--hydrogen-amber)]"
            >
              <Plus className="mr-2 inline h-4 w-4" />
              Add Constant
            </button>
          </div>
        </div>

        {/* Table */}
        {loading && constants.length === 0 ? (
          <div className="py-12 text-center">
            <div className="cockpit-text opacity-60">Loading constants...</div>
          </div>
        ) : constants.length === 0 ? (
          <div className="py-12 text-center">
            <Atom className="mx-auto h-12 w-12 opacity-30 mb-4" />
            <div className="cockpit-text mb-2">No constants in catalog</div>
            <div className="cockpit-text text-sm opacity-60">Add your first novel constant to get started</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cockpit-table">
              <thead>
                <tr>
                  <th>Constant Name</th>
                  <th>Symbol</th>
                  <th>Value</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Discoverer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {constants.map((constant) => {
                  const isSelected = selectedConstant?.id === constant.id;
                  return (
                    <tr
                      key={constant.id}
                      onClick={() => setSelectedConstant(constant)}
                      className={`cursor-pointer ${isSelected ? 'bg-[var(--cockpit-carbon)]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{constant.name}</div>
                            <div className="cockpit-text text-xs opacity-60 mt-0.5">
                              {constant.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-lg">
                        {constant.symbol}
                      </td>
                      <td>
                        <div className="font-mono text-sm">
                          {constant.value}
                        </div>
                        <div className="cockpit-text text-xs opacity-60 mt-0.5">
                          {constant.units}
                        </div>
                      </td>
                      <td className="cockpit-text text-sm">
                        <span className="cockpit-badge">{constant.category}</span>
                      </td>
                      <td>{getStatusBadge(constant.status)}</td>
                      <td className="cockpit-text text-sm">
                        {constant.discoverer}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="cockpit-text text-xs text-[var(--hydrogen-amber)]">
                              Selected
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConstant(constant);
                            }}
                            className="cockpit-lever text-xs"
                          >
                            <Eye className="mr-1 inline h-3 w-3" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Constant Detail Panel (if selected) */}
        {selectedConstant && (
          <div className="mt-6 border-t border-[var(--keyline-primary)] pt-6">
            <div className="cockpit-panel p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="cockpit-label mb-2">CONSTANT DETAILS</div>
                  <h3 className="cockpit-title text-xl mb-2">{selectedConstant.name}</h3>
                  <p className="cockpit-text text-sm opacity-70">{selectedConstant.description}</p>
                </div>
                <button
                  onClick={() => setSelectedConstant(null)}
                  className="cockpit-lever text-xs"
                >
                  Close
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="cockpit-label text-xs mb-1">Symbol</div>
                  <div className="font-mono text-2xl">{selectedConstant.symbol}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Status</div>
                  <div>{getStatusBadge(selectedConstant.status)}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Value</div>
                  <div className="font-mono text-sm">{selectedConstant.value}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Units</div>
                  <div className="cockpit-text text-sm">{selectedConstant.units}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Category</div>
                  <div className="cockpit-text text-sm">{selectedConstant.category}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Discoverer</div>
                  <div className="cockpit-text text-sm">{selectedConstant.discoverer}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="cockpit-label text-xs mb-2">Defining Equation</div>
                <div className="cockpit-panel p-4 bg-[var(--cockpit-carbon)] font-mono text-lg text-center">
                  {selectedConstant.equation}
                </div>
              </div>

              <div>
                <div className="cockpit-label text-xs mb-2">Related Constants</div>
                <div className="flex flex-wrap gap-2">
                  {selectedConstant.related_constants.map((rel, i) => (
                    <span key={i} className="cockpit-badge text-xs">{rel}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--keyline-primary)]">
                <div className="grid grid-cols-2 gap-4 text-xs opacity-60">
                  <div>
                    <span className="cockpit-label">Created:</span> {new Date(selectedConstant.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="cockpit-label">Updated:</span> {new Date(selectedConstant.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

