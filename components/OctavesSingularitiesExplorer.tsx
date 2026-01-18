/**
 * Octaves & Singularities Explorer
 * 
 * Interactive telescopic component for exploring octaves and singularities
 * with click-to-expand details, zoom functionality, and category snap integration
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Sparkles, Zap, Layers, Target } from 'lucide-react';

interface Octave {
  id: string;
  number: number | string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'infinite';
  fidelity?: string;
  depth?: number;
  protocols?: string[];
  singularities?: Singularity[];
}

interface Singularity {
  id: string;
  name: string;
  description: string;
  octave: number | string;
  type: 'blackhole' | 'prism' | 'holographic' | 'recursive' | 'infinite';
  status: 'active' | 'converged' | 'infinite';
  metadata?: Record<string, any>;
}

const octaves: Octave[] = [
  {
    id: 'octave-0',
    number: 0,
    name: 'Foundation',
    description: 'P-SEED-V17 - The seed from which the unexplainable call grew',
    status: 'active',
    protocols: ['P-SEED-V17', 'P-LAWS-V17', 'P-OMNI-V17-SSP-GEAR'],
  },
  {
    id: 'octave-2',
    number: 2,
    name: 'Base Mainnet Shell',
    description: 'Ethereum Layer 2 blockchain providing immutable, decentralized state',
    status: 'active',
    protocols: ['EVM', 'Smart Contracts', 'Consensus'],
    singularities: [
      {
        id: 'sing-blockchain-anchor',
        name: 'Blockchain Anchoring Singularity',
        description: 'On-chain anchoring point for state verification',
        octave: 2,
        type: 'blackhole',
        status: 'active',
      },
    ],
  },
  {
    id: 'octave-5',
    number: 5,
    name: 'Protocol Catalog',
    description: 'Natural Systems Protocol that animates everything automatically',
    status: 'active',
    protocols: ['NSPFRP', 'Natural System Protocol', 'Protocol Catalog'],
    singularities: [
      {
        id: 'sing-protocol-core',
        name: 'Protocol Core Singularity',
        description: 'Central protocol convergence point',
        octave: 5,
        type: 'prism',
        status: 'active',
      },
    ],
  },
  {
    id: 'octave-6',
    number: 6,
    name: 'Programming Language',
    description: 'Holographic Blackhole Prism Programming Language Layer',
    status: 'active',
    protocols: ['BLACKHOLE', 'PRISM', 'HOLOGRAPHIC', 'TUNING', 'CODING'],
    singularities: [
      {
        id: 'sing-blackhole',
        name: 'Blackhole Singularity',
        description: 'Information absorption and compression point',
        octave: 6,
        type: 'blackhole',
        status: 'active',
      },
      {
        id: 'sing-prism',
        name: 'Prism Singularity',
        description: 'Information refraction and spectrum analysis point',
        octave: 6,
        type: 'prism',
        status: 'active',
      },
      {
        id: 'sing-holographic',
        name: 'Holographic Singularity',
        description: 'Multi-dimensional information encoding point',
        octave: 6,
        type: 'holographic',
        status: 'active',
      },
    ],
  },
  {
    id: 'octave-7.0',
    number: '7.0',
    name: 'Recursive Self-Application',
    description: 'Protocol applies to itself recursively (Depth 1)',
    status: 'active',
    depth: 1,
    fidelity: '7.0',
    protocols: ['APPLY-NSPFRP-RECURSIVE', 'CREATE-RECURSIVE-PROOF'],
    singularities: [
      {
        id: 'sing-recursive-core',
        name: 'Recursive Core Singularity',
        description: 'Self-application convergence point',
        octave: '7.0',
        type: 'recursive',
        status: 'active',
      },
    ],
  },
  {
    id: 'octave-7.25',
    number: '7.25',
    name: 'Recursive Validation',
    description: 'Protocol validates itself recursively (Depth 2)',
    status: 'active',
    depth: 2,
    fidelity: '7.25',
    protocols: ['RECURSIVE-VALIDATE', 'CREATE-RECURSIVE-PROOF'],
  },
  {
    id: 'octave-7.5',
    number: '7.5',
    name: 'Recursive Enforcement',
    description: 'Protocol enforces itself recursively (Depth 3)',
    status: 'active',
    depth: 3,
    fidelity: '7.5',
    protocols: ['RECURSIVE-ENFORCE', 'CREATE-RECURSIVE-PROOF'],
  },
  {
    id: 'octave-7.75',
    number: '7.75',
    name: 'Infinite Octave Fidelity',
    description: 'Full infinite octave fidelity achieved (POST-SINGULARITY^7)',
    status: 'infinite',
    depth: 4,
    fidelity: '7.75+',
    protocols: ['CALCULATE-OCTAVE-FIDELITY', 'APPLY-TO-REPOSITORY', 'CHECK-SINGULARITY-7'],
    singularities: [
      {
        id: 'sing-infinite',
        name: 'Infinite Octave Singularity',
        description: 'Infinite scaling convergence point',
        octave: '7.75',
        type: 'infinite',
        status: 'infinite',
      },
      {
        id: 'sing-post-singularity-7',
        name: 'POST-SINGULARITY^7 Singularity',
        description: 'Recursive self-application at infinite depth',
        octave: '7.75',
        type: 'recursive',
        status: 'infinite',
      },
    ],
  },
  {
    id: 'octave-7.75+',
    number: '7.75+',
    name: 'Beyond Infinite',
    description: 'Infinite scaling beyond 7.75 - POST-SINGULARITY^7 Core',
    status: 'infinite',
    depth: 8,
    fidelity: '∞',
    protocols: ['POST-SINGULARITY^7', 'Infinite Recursive Folding'],
  },
];

export function OctavesSingularitiesExplorer() {
  const [expandedOctaves, setExpandedOctaves] = useState<Set<string>>(new Set());
  const [expandedSingularities, setExpandedSingularities] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [majorZoom, setMajorZoom] = useState(false);
  const [selectedOctave, setSelectedOctave] = useState<string | null>(null);

  const toggleOctave = (octaveId: string) => {
    const newExpanded = new Set(expandedOctaves);
    if (newExpanded.has(octaveId)) {
      newExpanded.delete(octaveId);
    } else {
      newExpanded.add(octaveId);
    }
    setExpandedOctaves(newExpanded);
  };

  const toggleSingularity = (singularityId: string) => {
    const newExpanded = new Set(expandedSingularities);
    if (newExpanded.has(singularityId)) {
      newExpanded.delete(singularityId);
    } else {
      newExpanded.add(singularityId);
    }
    setExpandedSingularities(newExpanded);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleMajorZoom = () => {
    setMajorZoom(prev => !prev);
    setZoomLevel(prev => prev === 1 ? 2.5 : 1);
  };

  const getSingularityIcon = (type: string) => {
    switch (type) {
      case 'blackhole': return <Target className="h-4 w-4" />;
      case 'prism': return <Sparkles className="h-4 w-4" />;
      case 'holographic': return <Layers className="h-4 w-4" />;
      case 'recursive': return <Zap className="h-4 w-4" />;
      case 'infinite': return <Maximize2 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getSingularityColor = (type: string) => {
    switch (type) {
      case 'blackhole': return 'text-purple-400';
      case 'prism': return 'text-blue-400';
      case 'holographic': return 'text-cyan-400';
      case 'recursive': return 'text-amber-400';
      case 'infinite': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'infinite': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'converged': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default: return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Zoom Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
            <Layers className="h-6 w-6 text-blue-400" />
            Octaves & Singularities Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
            Telescopic Navigation · Category Snap Integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4 text-slate-400" />
          </button>
          <span className="text-xs font-mono text-slate-400 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4 text-slate-400" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-2" />
          <button
            onClick={handleMajorZoom}
            className={`px-4 py-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 ${
              majorZoom ? 'border-blue-400' : 'border-blue-500/50'
            } hover:border-blue-400 transition-all rounded flex items-center gap-2`}
            title="Major Zoom"
          >
            {majorZoom ? (
              <>
                <Minimize2 className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-300 uppercase">Reset Zoom</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-300 uppercase">Major Zoom</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Octaves List */}
      <div 
        className="space-y-3 transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {octaves.map((octave) => (
          <div
            key={octave.id}
            className={`border-2 rounded-lg bg-slate-900/50 backdrop-blur-sm transition-all ${
              selectedOctave === octave.id
                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Octave Header */}
            <button
              onClick={() => {
                toggleOctave(octave.id);
                setSelectedOctave(octave.id === selectedOctave ? null : octave.id);
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {expandedOctaves.has(octave.id) ? (
                  <ChevronDown className="h-5 w-5 text-blue-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-500 flex-shrink-0" />
                )}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl font-black text-blue-400 font-mono">
                    {octave.number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        {octave.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(octave.status)}`}>
                        {octave.status}
                      </span>
                      {octave.fidelity && (
                        <span className="text-xs font-mono text-amber-400">
                          Fidelity: {octave.fidelity}
                        </span>
                      )}
                      {octave.depth && (
                        <span className="text-xs font-mono text-purple-400">
                          Depth: {octave.depth}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{octave.description}</p>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Octave Details */}
            {expandedOctaves.has(octave.id) && (
              <div className="px-4 pb-4 space-y-4 border-t border-slate-800">
                {/* Protocols */}
                {octave.protocols && octave.protocols.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Protocols
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {octave.protocols.map((protocol, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-cyan-400"
                        >
                          {protocol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Singularities */}
                {octave.singularities && octave.singularities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Singularities ({octave.singularities.length})
                    </h4>
                    <div className="space-y-2">
                      {octave.singularities.map((singularity) => (
                        <div
                          key={singularity.id}
                          className="border border-slate-800 rounded p-3 bg-slate-950/50"
                        >
                          <button
                            onClick={() => toggleSingularity(singularity.id)}
                            className="w-full flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {expandedSingularities.has(singularity.id) ? (
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-500" />
                              )}
                              <div className={getSingularityColor(singularity.type)}>
                                {getSingularityIcon(singularity.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white">
                                    {singularity.name}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusColor(singularity.status)}`}>
                                    {singularity.type}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {singularity.description}
                                </p>
                              </div>
                            </div>
                          </button>
                          {expandedSingularities.has(singularity.id) && (
                            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                              <div className="text-xs text-slate-400">
                                <span className="font-semibold">Octave:</span> {singularity.octave}
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="font-semibold">Type:</span> {singularity.type}
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="font-semibold">Status:</span> {singularity.status}
                              </div>
                              {singularity.metadata && (
                                <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800">
                                  <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                                    {JSON.stringify(singularity.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Snap Integration */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            Category Snap Integration
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          This explorer integrates with the Category Snap system. Each octave and singularity can be 
          expanded to reveal detailed category snap information, including recursive proof categories, 
          protocol specifications, and architectural relationships.
        </p>
      </div>
    </div>
  );
}
