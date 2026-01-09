/**
 * Proof Library Navigator
 * Table-based navigator for mathematical/scientific proofs
 * Format similar to PoC Archive navigator
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, FileText, ExternalLink, Eye, BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';

interface Proof {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  proof_text: string;
  status: 'draft' | 'verified' | 'peer_reviewed';
  references: string[];
  created_at: string;
  updated_at: string;
}

export function ProofLibraryNavigator() {
  const [proofs, setProofs] = useState<Proof[]>([
    {
      id: 'proof-001',
      title: 'Holographic Hydrogen Fractal Coherence Theorem',
      author: 'FractiAI Research',
      category: 'Quantum Mechanics',
      description: 'Mathematical proof of coherence preservation in HHF-AI systems',
      proof_text: 'Proof content...',
      status: 'verified',
      references: ['arxiv:2401.00001', 'doi:10.1234/hhf.2024'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'proof-002',
      title: 'Fractal Scaling Law for Nested Synthverses',
      author: 'FractiAI Research',
      category: 'Mathematics',
      description: 'Proof of self-similar scaling properties in nested reality structures',
      proof_text: 'Proof content...',
      status: 'peer_reviewed',
      references: ['arxiv:2401.00002'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);

  const handleRefresh = () => {
    setLoading(true);
    // TODO: Implement API call
    setTimeout(() => setLoading(false), 500);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'gray', label: 'Draft' },
      verified: { color: 'green', label: 'Verified' },
      peer_reviewed: { color: 'blue', label: 'Peer Reviewed' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
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
            <div className="cockpit-label">PROOF LIBRARY</div>
            <div className="cockpit-title mt-1 text-2xl">MATHEMATICAL & SCIENTIFIC PROOFS</div>
            <div className="cockpit-text mt-2 text-sm opacity-70">
              Verified proofs and theorems from HHF-AI research
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="cockpit-lever px-4 py-2 text-sm"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 inline h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              className="cockpit-lever px-4 py-2 text-sm bg-[var(--hydrogen-amber)]/20 border-[var(--hydrogen-amber)]"
            >
              <Plus className="mr-2 inline h-4 w-4" />
              Add Proof
            </button>
          </div>
        </div>

        {/* Table */}
        {loading && proofs.length === 0 ? (
          <div className="py-12 text-center">
            <div className="cockpit-text opacity-60">Loading proofs...</div>
          </div>
        ) : proofs.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 opacity-30 mb-4" />
            <div className="cockpit-text mb-2">No proofs in library</div>
            <div className="cockpit-text text-sm opacity-60">Add your first mathematical proof to get started</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cockpit-table">
              <thead>
                <tr>
                  <th>Proof Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>References</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proofs.map((proof) => {
                  const isSelected = selectedProof?.id === proof.id;
                  return (
                    <tr
                      key={proof.id}
                      onClick={() => setSelectedProof(proof)}
                      className={`cursor-pointer ${isSelected ? 'bg-[var(--cockpit-carbon)]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{proof.title}</div>
                            <div className="cockpit-text text-xs opacity-60 mt-0.5">
                              {proof.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="cockpit-text text-sm">
                        <span className="cockpit-badge">{proof.category}</span>
                      </td>
                      <td className="cockpit-text text-sm">
                        {proof.author}
                      </td>
                      <td>{getStatusBadge(proof.status)}</td>
                      <td className="cockpit-text text-sm">
                        <div className="flex flex-col gap-1">
                          {proof.references.slice(0, 2).map((ref, i) => (
                            <span key={i} className="text-xs opacity-70">{ref}</span>
                          ))}
                          {proof.references.length > 2 && (
                            <span className="text-xs opacity-50">+{proof.references.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="cockpit-text text-sm">
                        {new Date(proof.created_at).toLocaleDateString()}
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
                              setSelectedProof(proof);
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

        {/* Proof Detail Panel (if selected) */}
        {selectedProof && (
          <div className="mt-6 border-t border-[var(--keyline-primary)] pt-6">
            <div className="cockpit-panel p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="cockpit-label mb-2">PROOF DETAILS</div>
                  <h3 className="cockpit-title text-xl mb-2">{selectedProof.title}</h3>
                  <p className="cockpit-text text-sm opacity-70">{selectedProof.description}</p>
                </div>
                <button
                  onClick={() => setSelectedProof(null)}
                  className="cockpit-lever text-xs"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="cockpit-label text-xs mb-1">Category</div>
                  <div className="cockpit-text text-sm">{selectedProof.category}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Author</div>
                  <div className="cockpit-text text-sm">{selectedProof.author}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Status</div>
                  <div>{getStatusBadge(selectedProof.status)}</div>
                </div>
                <div>
                  <div className="cockpit-label text-xs mb-1">Created</div>
                  <div className="cockpit-text text-sm">
                    {new Date(selectedProof.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="cockpit-label text-xs mb-2">References</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProof.references.map((ref, i) => (
                    <span key={i} className="cockpit-badge text-xs">{ref}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="cockpit-label text-xs mb-2">Proof Content</div>
                <div className="cockpit-panel p-4 bg-[var(--cockpit-carbon)] font-mono text-sm whitespace-pre-wrap">
                  {selectedProof.proof_text}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

