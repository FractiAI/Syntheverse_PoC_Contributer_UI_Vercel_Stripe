'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  Globe, 
  Store, 
  Sparkles, 
  Building2,
  Theater,
  Shield,
  Infinity,
  Layers,
  Grid3x3,
  Users
} from 'lucide-react';
import { HolographicBlackholeSymbol } from './HolographicBlackholeSymbol';

interface Syntheverse7SurfaceProps {
  isAuthenticated?: boolean;
}

export default function Syntheverse7Surface({
  isAuthenticated = false,
}: Syntheverse7SurfaceProps) {
  return (
    <div className="cockpit-bg min-h-screen font-mono">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-7xl w-full space-y-12">
          {/* Holographic Blackhole Symbol */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <HolographicBlackholeSymbol size="xl" animated energized />
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white uppercase">
                Syntheverse<span className="text-[#3399ff]">^7</span>
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-[#ffcc33] uppercase tracking-wider">
                Post-Singularity^7 Full Stack HHF-AI FSR^7 Core Services
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-purple-400 font-bold uppercase tracking-wider">
                <Zap className="h-4 w-4" />
                <span>Full Infinite Octave Fidelity · POST-SINGULARITY^7 Active</span>
                <Infinity className="h-4 w-4" />
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#3399ff]/50 to-transparent" />
          </div>

          {/* Main Value Proposition */}
          <div className="cockpit-panel p-10 border-l-4 border-[#3399ff] bg-black/40 backdrop-blur-xl space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">
                The Complete Post-Singularity^7 Platform
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Access the full stack of HHF-AI FSR^7 core services through Creator-Studio interfaces. 
                Experience marketplaces, services, and enterprise ecosystems delivered through new FSR experience theaters. 
                Safe access anywhere, anytime.
              </p>
            </div>
          </div>

          {/* C-S Surfaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Creator-Studio Surfaces */}
            <div className="cockpit-panel p-8 border border-[#3399ff]/30 bg-black/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-[#3399ff]" />
                <h3 className="text-xl font-black text-white uppercase">C-S Surfaces</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Creator-Studio interfaces delivering full HHF-AI FSR^7 core services through intuitive, 
                infinite-octave-fidelity surfaces.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Full stack HHF-AI FSR^7 services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Infinite octave fidelity interfaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>POST-SINGULARITY^7 compliance</span>
                </li>
              </ul>
            </div>

            {/* Marketplaces */}
            <div className="cockpit-panel p-8 border border-[#ffcc33]/30 bg-black/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <Store className="h-6 w-6 text-[#ffcc33]" />
                <h3 className="text-xl font-black text-white uppercase">Marketplaces</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Access curated marketplaces for protocols, features, services, and enterprise solutions 
                through C-S interfaces.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Protocol marketplace</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Feature marketplace</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Service marketplace</span>
                </li>
              </ul>
            </div>

            {/* Experiences */}
            <div className="cockpit-panel p-8 border border-purple-500/30 bg-black/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-black text-white uppercase">Experiences</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Immersive FSR experience theaters delivering post-singularity^7 experiences 
                through holographic interfaces.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>FSR experience theaters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Holographic interfaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Multi-sensory experiences</span>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="cockpit-panel p-8 border border-green-500/30 bg-black/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <Grid3x3 className="h-6 w-6 text-green-400" />
                <h3 className="text-xl font-black text-white uppercase">Services</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Comprehensive services ecosystem delivered through C-S interfaces, 
                enabling enterprise-grade operations.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>HHF-AI core services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Protocol services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Enterprise services</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Ecosystems */}
            <div className="cockpit-panel p-8 border border-blue-500/30 bg-black/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-black text-white uppercase">Enterprise Ecosystems</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enterprise-grade ecosystems with full integration capabilities, 
                delivered through C-S interfaces for seamless operations.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Enterprise integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Scalable infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Enterprise support</span>
                </li>
              </ul>
            </div>

            {/* FSR Experience Theaters */}
            <div className="cockpit-panel p-8 border border-yellow-500/30 bg-black/30 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <Theater className="h-6 w-6 text-yellow-400" />
                <h3 className="text-xl font-black text-white uppercase">FSR Theaters</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                New FSR experience theaters providing safe, immersive access 
                to post-singularity^7 capabilities anywhere, anytime.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Safe access anywhere</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Real-time experience delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 text-[#ffcc33] mt-0.5 flex-shrink-0" />
                  <span>Any time, any place</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="cockpit-panel p-10 border-l-4 border-[#ffcc33] bg-black/40 backdrop-blur-xl space-y-6">
            <h2 className="text-2xl font-black text-white uppercase">New Benefits & Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#ffcc33] uppercase">Technical Benefits</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-[#3399ff] mt-0.5 flex-shrink-0" />
                    <span>Full stack HHF-AI FSR^7 core services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-[#3399ff] mt-0.5 flex-shrink-0" />
                    <span>POST-SINGULARITY^7 compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-[#3399ff] mt-0.5 flex-shrink-0" />
                    <span>Infinite octave fidelity (1.0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-[#3399ff] mt-0.5 flex-shrink-0" />
                    <span>NSPFRP-compliant architecture</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#ffcc33] uppercase">User Benefits</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Safe access anywhere, anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Global access through C-S interfaces</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Enterprise ecosystem integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Theater className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>FSR experience theaters</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cockpit-panel p-10 border-l-4 border-[#3399ff] bg-black/40 backdrop-blur-xl space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white uppercase">Access Syntheverse^7 Now</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Experience the complete post-singularity^7 platform through Creator-Studio interfaces. 
                Access marketplaces, experiences, services, and enterprise ecosystems through new FSR experience theaters.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated ? (
                <Link 
                  href="/auth/google" 
                  className="cockpit-lever flex-1 py-4 px-8 flex items-center justify-center gap-3 bg-[#3399ff] text-white hover:bg-[#3399ff]/80 transition-all font-black text-sm tracking-widest"
                >
                  START WITH C-S SURFACES
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link 
                  href="/dashboard" 
                  className="cockpit-lever flex-1 py-4 px-8 flex items-center justify-center gap-3 bg-green-600 text-white hover:bg-green-600/80 transition-all font-black text-sm tracking-widest"
                >
                  ENTER CREATOR-STUDIO
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              
              <Link 
                href="/onboarding" 
                className="cockpit-lever flex-1 py-4 px-8 flex items-center justify-center gap-3 border-2 border-[#ffcc33] text-[#ffcc33] hover:bg-[#ffcc33]/10 transition-all font-black text-sm tracking-widest"
              >
                EXPLORE FSR THEATERS
                <Theater className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Footer Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                POST-SINGULARITY^7 Active · FSR^7 Core Services Live
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 uppercase tracking-wider">
              <span>Anywhere</span>
              <span>·</span>
              <span>Anytime</span>
              <span>·</span>
              <span className="text-green-400">Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
