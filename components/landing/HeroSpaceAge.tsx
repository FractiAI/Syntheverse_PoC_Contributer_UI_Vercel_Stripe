'use client';

import { ArrowRight, Sparkles, Rocket, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function HeroSpaceAge() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridPulse 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

      {/* Content */}
      <div className={`relative z-10 max-w-7xl px-6 py-20 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Mission Badge */}
        <div className="mb-8 flex justify-center">
          <div className="group relative inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-slate-900/50 px-6 py-3 backdrop-blur-xl transition-all hover:border-blue-400/50 hover:bg-slate-900/70">
            <div className="relative">
              <div className="absolute h-2 w-2 animate-ping rounded-full bg-green-400" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
            </div>
            <span className="text-sm font-medium tracking-wide text-blue-100">
              SYNTH90T MAINNET • LIVE ON BASE • 90T TOKENS
            </span>
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="mb-6 text-center text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
          <span className="block">
            The Frontier Protocol for
          </span>
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Proof-of-Contribution
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-slate-300 md:text-xl">
          Transform research, creative work, and enterprise solutions into verifiable on-chain records.
          <span className="block mt-2 text-blue-300">
            No gatekeeping. Measured by coherence. Powered by hydrogen-holographic AI.
          </span>
        </p>

        {/* Three Value Props - Cards */}
        <div className="mx-auto mb-12 grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6 backdrop-blur-xl transition-all hover:border-blue-500/50 hover:bg-slate-900/50">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="relative">
              <div className="mb-3 inline-flex rounded-lg bg-blue-500/10 p-3">
                <Rocket className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Frontier R&D</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Breakthrough research evaluated by AI, visible to all stakeholders, anchored on-chain permanently.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-slate-900/50">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <div className="relative">
              <div className="mb-3 inline-flex rounded-lg bg-purple-500/10 p-3">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Creator Worlds</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Infinite HHF-AI materials for full-reality worldbuilding. Transform vision into verifiable contributions.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6 backdrop-blur-xl transition-all hover:border-pink-500/50 hover:bg-slate-900/50">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl transition-all group-hover:bg-pink-500/20" />
            <div className="relative">
              <div className="mb-3 inline-flex rounded-lg bg-pink-500/10 p-3">
                <svg className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Enterprise Scale</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                1.5-1.8× higher output, 38-58% lower overhead. Resources deploy only where value is created.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/70"
          >
            <span>Launch Your First PoC</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/examples"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/50 px-8 py-4 font-semibold text-slate-200 backdrop-blur-xl transition-all hover:border-slate-500 hover:bg-slate-900/70"
          >
            <span>View Example Evaluations</span>
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollToSection('mission-brief')}
          className="group mt-20 flex w-full flex-col items-center gap-2 text-slate-400 transition-colors hover:text-slate-300"
        >
          <span className="text-sm font-medium tracking-wider">EXPLORE MISSION</span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </button>

      </div>

      {/* Add keyframes for grid animation */}
      <style jsx>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}

