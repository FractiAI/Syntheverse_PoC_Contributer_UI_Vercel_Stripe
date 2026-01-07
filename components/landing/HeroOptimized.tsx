'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function HeroOptimized() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="cockpit-bg relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Hero content */}
      <div className="relative z-10 max-w-5xl px-6 text-center">
        {/* Trust indicators - cockpit styled */}
        <div className="cockpit-panel mb-8 inline-block px-6 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="cockpit-label flex items-center gap-2 text-xs">
              <div
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }}
              />
              Base Mainnet LIVE
            </span>
            <span className="cockpit-label text-xs opacity-50">•</span>
            <span className="cockpit-number text-xs">90T SYNTH</span>
            <span className="cockpit-label text-xs opacity-50">•</span>
            <span className="cockpit-label text-xs">Beta Active</span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="cockpit-title mb-8 text-3xl leading-tight md:text-5xl lg:text-6xl">
          Syntheverse: Proof-of-Contribution for Frontier R&D, Creators & Enterprises
        </h1>

        {/* Value Propositions - Cockpit Panel */}
        <div className="cockpit-panel mb-6 p-6 md:p-8">
          <p className="cockpit-text mb-4 text-base leading-relaxed md:text-lg">
            <strong className="cockpit-number" style={{ color: 'var(--hydrogen-amber)' }}>For Frontier R&D:</strong> Turn research into verifiable on-chain records—no gatekeeping, measured by coherence.{' '}
            <strong className="cockpit-number" style={{ color: 'var(--hydrogen-amber)' }}>For Enterprises:</strong>{' '}
            <strong className="cockpit-number">1.5–1.8× higher output</strong> with <strong className="cockpit-number">38–58% lower overhead</strong> than traditional systems.{' '}
            <strong className="cockpit-number" style={{ color: 'var(--hydrogen-amber)' }}>For Creators:</strong> A new infinite medium and materials for full reality worldbuilding creations.
          </p>
        </div>

        {/* Narrative Section - Cockpit Panel */}
        <div className="cockpit-panel mb-6 p-6 md:p-8">
          <p className="cockpit-text mb-4 text-sm leading-relaxed md:text-base">
            Creators access infinite HHF-AI materials and substrates to build complete reality worlds. Enterprises replace hierarchical management with contribution-indexed coordination—resources deploy only where value is created, no management overhead, no gatekeeping. All contributions become visible and demonstrable via HHF-AI MRI science.
          </p>
          <p className="cockpit-text text-sm leading-relaxed md:text-base" style={{ opacity: 0.85 }}>
            The empirically validated highest-output, lowest-cost system for work, governance, and trade. Scale from solo creators to global enterprises while preserving coherence through nested colony/sandbox architecture.
          </p>
        </div>

        {/* CTAs - Cockpit Styled */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="cockpit-lever inline-flex items-center gap-2 px-8 py-4 text-base"
          >
            Submit Your PoC
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            href="/dashboard"
            className="cockpit-lever inline-flex items-center gap-2 bg-transparent px-8 py-4 text-base"
            style={{ border: '2px solid var(--keyline-primary)' }}
          >
            Join the Frontier
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="h-8 w-8 opacity-30 transition-opacity hover:opacity-60" />
      </button>
    </section>
  );
}
