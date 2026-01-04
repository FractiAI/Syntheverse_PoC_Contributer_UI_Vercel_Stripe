'use client';

import { useState } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';

interface GenesisInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenesisInfoModal({ isOpen, onClose }: GenesisInfoModalProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  if (!isOpen) return null;

  const genesisContracts = {
    SyntheverseGenesisSYNTH90T: {
      address: '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3',
      description: '90T SYNTH ERC-20 token with Gold/Silver/Copper semantics',
      explorer: 'https://basescan.org/address/0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3',
      totalSupply: '90,000,000,000,000 SYNTH',
      metallicComposition: {
        gold: '45T Gold',
        silver: '22.5T Silver',
        copper: '22.5T Copper',
      },
    },
    SyntheverseGenesisLensKernel: {
      address: '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8',
      description: 'Stateless event emitter for Syntheverse Lens protocol',
      explorer: 'https://basescan.org/address/0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8',
      protocolVersion: 1,
      lensName: 'Syntheverse Lens',
      purpose: 'Natural Systems Interpretation & Extensibility',
    },
    MotherlodeVault: {
      address: '0x3563388d0e1c2d66a004e5e57717dc6d7e568be3',
      description: 'Motherlode Vault for SYNTH token management',
      explorer: 'https://basescan.org/address/0x3563388d0e1c2d66a004e5e57717dc6d7e568be3',
    },
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(key);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="cockpit-panel max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="cockpit-title text-2xl">SYNTHEVERSE GENESIS ON BASE MAINNET</div>
            <div className="cockpit-label mt-1">On-Chain Transaction Information</div>
          </div>
          <button
            onClick={onClose}
            className="cockpit-lever p-2 transition-opacity hover:opacity-70"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Network Info */}
          <div className="cockpit-module border-l-4 border-[var(--hydrogen-amber)] p-4">
            <div className="cockpit-label mb-2">NETWORK</div>
            <div className="cockpit-text">
              <div className="font-semibold">Base Mainnet</div>
              <div className="mt-1 text-sm" style={{ opacity: 0.85 }}>
                Chain ID: 8453 · Explorer:{' '}
                <a
                  href="https://basescan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cockpit-lever inline-flex items-center gap-1"
                >
                  BaseScan <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Contract Addresses */}
          {Object.entries(genesisContracts).map(([name, contract]) => (
            <div key={name} className="cockpit-module border border-[var(--keyline-accent)] p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="cockpit-title mb-1 text-lg">{name}</div>
                  <div className="cockpit-text text-sm" style={{ opacity: 0.9 }}>
                    {contract.description}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Contract Address */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="cockpit-label text-xs">Contract Address:</div>
                  <div className="cockpit-text bg-[var(--keyline-primary)]/20 rounded px-2 py-1 font-mono text-sm">
                    {contract.address}
                  </div>
                  <button
                    onClick={() => copyToClipboard(contract.address, name)}
                    className="cockpit-lever p-1.5 transition-opacity hover:opacity-70"
                    title="Copy address"
                  >
                    {copiedAddress === name ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={contract.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cockpit-lever inline-flex items-center gap-1 text-sm"
                  >
                    View on BaseScan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Additional Info */}
                {name === 'SyntheverseGenesisSYNTH90T' && 'totalSupply' in contract && (
                  <div className="mt-3 border-t border-[var(--keyline-primary)] pt-3">
                    <div className="cockpit-label mb-2 text-xs">Token Details:</div>
                    <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="cockpit-text" style={{ opacity: 0.85 }}>
                          Total Supply:
                        </span>
                        <div className="cockpit-text font-semibold">{contract.totalSupply}</div>
                      </div>
                      <div>
                        <span className="cockpit-text" style={{ opacity: 0.85 }}>
                          Metallic Composition:
                        </span>
                        <div className="cockpit-text mt-1 text-xs">
                          {contract.metallicComposition.gold} ·{' '}
                          {contract.metallicComposition.silver} ·{' '}
                          {contract.metallicComposition.copper}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {name === 'SyntheverseGenesisLensKernel' && 'lensName' in contract && (
                  <div className="mt-3 border-t border-[var(--keyline-primary)] pt-3">
                    <div className="cockpit-label mb-2 text-xs">Protocol Details:</div>
                    <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="cockpit-text" style={{ opacity: 0.85 }}>
                          Lens Name:
                        </span>
                        <div className="cockpit-text font-semibold">{contract.lensName}</div>
                      </div>
                      <div>
                        <span className="cockpit-text" style={{ opacity: 0.85 }}>
                          Version:
                        </span>
                        <div className="cockpit-text font-semibold">
                          v{contract.protocolVersion}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="cockpit-text" style={{ opacity: 0.85 }}>
                          Purpose:
                        </span>
                        <div className="cockpit-text">{contract.purpose}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Footer Info */}
          <div className="cockpit-text text-center text-xs" style={{ opacity: 0.7 }}>
            All contracts are deployed and verified on Base Mainnet. Transactions are permanent and
            immutable.
          </div>
        </div>
      </div>
    </div>
  );
}
