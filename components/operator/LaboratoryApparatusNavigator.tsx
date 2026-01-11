'use client';

import { useState, useEffect } from 'react';
import { Settings, Cpu, Sparkles } from 'lucide-react';
import { CreatorCockpitNavigation } from '../creator/CreatorCockpitNavigation';

export function LaboratoryApparatusNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('faraday_laboratory_apparatus_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('faraday_laboratory_apparatus_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #9370DB',
      background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Coil/apparatus icon */}
              <div className="w-10 h-10 rounded-full border-2 border-[#9370DB] flex items-center justify-center bg-gradient-to-br from-[#9370DB]/20 to-transparent relative">
                <Settings className="h-5 w-5 text-[#9370DB]" />
                {/* Rotating magnetic field effect */}
                <div className="absolute inset-0 rounded-full border border-[#BA55D3] opacity-50" style={{
                  animation: 'spin 4s linear infinite',
                }}></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#9370DB] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #9370DB',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#9370DB]">
                LABORATORY APPARATUS
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Experimental Controls & Induction Coils
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#9370DB] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 md:px-5 py-4 md:py-5">
          <div className="mb-4 p-3 bg-[#9370DB]/5 border-l-2 border-[#9370DB] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "I have far more confidence in the one man who works mentally and bodily at a matter 
              than in the six who merely talk about it. The important thing is to know how to take all things quietly."
              <span className="block mt-2 text-xs text-[#9370DB]">— Michael Faraday</span>
            </p>
          </div>
          <CreatorCockpitNavigation />
        </div>
      )}
    </div>
  );
}

