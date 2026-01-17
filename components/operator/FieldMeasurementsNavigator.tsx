'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Gauge } from 'lucide-react';

export function FieldMeasurementsNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('faraday_field_measurements_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('faraday_field_measurements_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #4169E1',
      background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Electromagnetic field icon */}
              <div className="w-10 h-10 rounded-full border-2 border-[#4169E1] flex items-center justify-center bg-gradient-to-br from-[#4169E1]/20 to-transparent relative">
                <Gauge className="h-5 w-5 text-[#4169E1]" />
                {/* Electric spark effect */}
                <div className="absolute inset-0 rounded-full border border-[#7B68EE] animate-pulse"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#4169E1] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #4169E1',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#4169E1]">
                FIELD MEASUREMENTS
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Electromagnetic Observations & System Flux
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#4169E1] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-3 bg-[#4169E1]/5 border-l-2 border-[#4169E1] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "Nothing is too wonderful to be true, if it be consistent with the laws of nature. 
              I have been so electrically occupied of late that I feel as if hungry for a little chemistry."
              <span className="block mt-2 text-xs text-[#4169E1]">— Michael Faraday</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

