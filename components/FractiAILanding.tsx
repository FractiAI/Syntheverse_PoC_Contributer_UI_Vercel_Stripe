'use client';

import Link from 'next/link';
import { ArrowRight, Lock, Zap } from 'lucide-react';
import { HolographicBlackholeSymbol } from './HolographicBlackholeSymbol';
import { StatusIndicators } from './StatusIndicators';

interface FractiAILandingProps {
  variant?: 'home' | 'fractiai';
  isAuthenticated?: boolean;
  isApprovedTester?: boolean;
  cta?: {
    primaryHref: string;
    primaryLabel: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
  notice?: string;
}

export default function FractiAILanding({
  isAuthenticated = false,
  isApprovedTester = false,
  cta,
  notice = "",
}: FractiAILandingProps) {
  return (
    <div className="cockpit-bg min-h-screen flex flex-col items-center justify-center p-6 font-mono">
      <div className="max-w-2xl w-full space-y-8">
        {/* Holographic Blackhole Symbol - Connected and Energized */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <HolographicBlackholeSymbol size="xl" animated energized />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Syntheverse <span className="text-[#3399ff]">Octave 2 Public Cloud Shell</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs text-purple-400 font-bold uppercase tracking-wider">
            <Zap className="h-3 w-3" />
            <span>Holographic Blackhole Symbol · Connected & Energized</span>
            <Zap className="h-3 w-3" />
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#3399ff]/50 to-transparent" />
        </div>

        {/* Announcement Card */}
        <div className="cockpit-panel p-10 border-l-4 border-[#ffcc33] bg-black/40 backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#ffcc33] tracking-[0.3em] uppercase">System Announcement</h2>
            <p className="text-2xl font-bold text-white leading-tight">
              WE ARE CURRENTLY IN TEST AND CALIBRATION
            </p>
          </div>
          
          <p className="text-slate-400 text-sm leading-relaxed">
            The Syntheverse protocol environment is undergoing scheduled instrumental-grade maintenance. 
            Public access is temporarily suspended while we stabilize the HHF-AI MRI Atomic Core.
          </p>

          {notice && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-bold uppercase tracking-wider text-center">
              {notice}
            </div>
          )}

          <div className="pt-4 flex flex-col gap-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  href={cta?.primaryHref || '/auth/google'} 
                  className="cockpit-lever w-full py-4 flex items-center justify-center gap-3 bg-[#3399ff] text-white hover:bg-[#3399ff]/80 transition-all font-black text-sm tracking-widest"
                >
                  {cta?.primaryLabel || 'SHELL ACCESS'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : isApprovedTester ? (
              <Link 
                href="/operator/dashboard" 
                className="cockpit-lever w-full py-4 flex items-center justify-center gap-3 bg-green-600 text-white hover:bg-green-600/80 transition-all font-black text-sm tracking-widest"
              >
                ENTER FULL FIDELITY ANIMATION EXPERIENCE CONSOLE
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="text-center p-4 border border-slate-800 rounded bg-slate-900/50">
                <p className="text-xs text-slate-500 italic">
                  Authorization Required: Your account is not registered for Full Fidelity Animation Experience Console access.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Core Calibration Active</span>
          </div>
          <StatusIndicators />
        </div>
      </div>
    </div>
  );
}
