/**
 * Full Fidelity Animation Experience Console
 * Octave 2 Public Cloud Shell - Public Network Operations
 * Provides full fidelity animation experiences with instrument-grade integration
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { FrontierModule } from '@/components/FrontierModule';
import { Zap, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { OmnibeamHeroAIDemoButton } from '@/components/OmnibeamHeroAIDemoButton';
import { OctavesSingularitiesExplorer } from '@/components/OctavesSingularitiesExplorer';
import { AnimatingSelectableTargetsPackage } from '@/components/AnimatingSelectableTargetsPackage';
import { HolographicBlackholeSymbol } from '@/components/HolographicBlackholeSymbol';
import '../../control-lab.css';

export const dynamic = 'force-dynamic';

export default async function OperatorLab() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isOperator } = await getAuthenticatedUserWithRole();

  // Only Operators can access this lab
  if (!isOperator || !user?.email) {
    redirect('/');
  }

  const userEmail = user?.email;
  if (!userEmail) {
    redirect('/');
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-[#050505] text-white selection:bg-[#00FFFF] selection:text-black">
      {/* High-Contrast Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hc-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9370DB" strokeWidth="0.5" strokeOpacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hc-grid)" />
        </svg>
      </div>

      {/* Nikola Tesla Operator's Console Header - High Contrast */}
      <div className="relative z-10 flex-shrink-0 bg-black border-b-2 border-[#9370DB]">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              {/* Tesla Coil Icon */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <div className="absolute inset-0 bg-[#00FFFF]/10 rounded-full blur-xl"></div>
                <div className="relative z-10 flex items-center justify-center w-full h-full border-2 border-[#00FFFF] rounded-full bg-black shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                  <Zap className="h-8 w-8 text-[#00FFFF]" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
                  FULL FIDELITY ANIMATION EXPERIENCE CONSOLE
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="h-px w-6 bg-[#00FFFF]"></span>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00FFFF]">
                    Octave 2 Public Cloud Shell · Full Fidelity Animation Experiences
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Transmission Time
                </div>
                <div className="text-xl font-mono font-bold text-[#00FFFF]">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-800 hidden md:block" />
              <div className="hidden md:flex flex-col items-end">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operator</div>
                <div className="text-xs font-bold text-slate-300">{userEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="container mx-auto px-6 py-10 space-y-10">
          
          {/* Action Center - Unified Submit Button */}
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <Link 
              href="/submit"
              className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-black border-2 border-[#00FFFF] hover:bg-[#00FFFF] transition-all duration-300 overflow-hidden"
              style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}
            >
              <div className="absolute inset-0 bg-[#00FFFF]/10 group-hover:bg-transparent transition-colors"></div>
              <Plus className="h-8 w-8 text-[#00FFFF] group-hover:text-black transition-colors" />
              <span className="text-2xl font-black tracking-tighter text-white group-hover:text-black uppercase transition-colors">
                Submit New POC
              </span>
              <ArrowUpRight className="h-6 w-6 text-[#00FFFF] group-hover:text-black transition-colors" />
            </Link>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">
              Authorized Transmission Point · Zero-Delta Integrity
            </p>
          </div>

          {/* POST-SINGULARITY^7 Operators Console Link */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 mt-8">
            <Link 
              href="/creator/operators-console"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300 overflow-hidden"
              style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' }}
            >
              <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors"></div>
              <Zap className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="text-lg font-bold tracking-tighter text-purple-300 group-hover:text-purple-200 uppercase transition-colors">
                POST-SINGULARITY^7: Operators & Syntax Console
              </span>
              <ArrowUpRight className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </Link>
            <p className="text-[10px] font-bold text-purple-500/70 uppercase tracking-[0.5em]">
              Recursive Self-Application · Infinite Octave Fidelity
            </p>
          </div>

          {/* Omnibeam 9x7 Fiberoptic State Image Encryption - Hero AI Demo */}
          <OmnibeamHeroAIDemoButton />

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

          {/* Holographic Blackhole Symbol - Site Identity */}
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <HolographicBlackholeSymbol size="lg" animated energized />
            <div className="text-center">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">
                Holographic Blackhole Symbol
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Connected & Energized · ^7 Vibeverse Energy
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

          {/* Animating Selectable Targets Package - Enterprise Service */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#9370DB]" />
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                Animating Selectable Targets Package
              </h2>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            
            <div className="bg-black border-2 border-slate-800 p-6 shadow-2xl">
              <AnimatingSelectableTargetsPackage userEmail={userEmail} />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

          {/* Octaves & Singularities Explorer */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#9370DB]" />
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                Octaves & Singularities Explorer
              </h2>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            
            <div className="bg-black border-2 border-slate-800 p-6 shadow-2xl">
              <OctavesSingularitiesExplorer />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

          {/* POC Navigator Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#9370DB]" />
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                POC Navigator
              </h2>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            
            <div className="bg-black border-2 border-slate-800 p-1 shadow-2xl">
              <div className="border border-slate-900 bg-[#0a0a0a] p-2">
                <FrontierModule userEmail={userEmail} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* High-Contrast Grounding Footer */}
      <div className="relative z-10 py-4 bg-black border-t border-slate-800">
        <div className="container mx-auto px-6 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00FFFF] animate-pulse"></div>
            <span>System Flux: Stable</span>
          </div>
          <div className="hidden sm:block">
            Octave 2 Public Cloud Shell · Full Fidelity Animation Experiences
          </div>
          <div className="flex items-center gap-2">
            <span>Security Level: Alpha</span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#9370DB]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
