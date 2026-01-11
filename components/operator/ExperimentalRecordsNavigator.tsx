'use client';

import { useState, useEffect } from 'react';
import { BookOpen, FlaskConical, FileText } from 'lucide-react';
import { ActivityAnalytics } from '../activity/ActivityAnalytics';

export function ExperimentalRecordsNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('faraday_experimental_records_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('faraday_experimental_records_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #CD853F',
      background: 'linear-gradient(135deg, rgba(205, 133, 63, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Laboratory notebook icon */}
              <div className="w-10 h-10 rounded-full border-2 border-[#CD853F] flex items-center justify-center bg-gradient-to-br from-[#CD853F]/20 to-transparent">
                <FlaskConical className="h-5 w-5 text-[#CD853F]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#CD853F] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #CD853F',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#CD853F]">
                EXPERIMENTAL RECORDS
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Discovery Logs & Observation Journals
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#CD853F] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-3 bg-[#CD853F]/5 border-l-2 border-[#CD853F] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "Work. Finish. Publish. The lectures I shall deliver for the Royal Institution will be 
              of the most perfect experimental kind, and I am preparing all the necessary apparatus."
              <span className="block mt-2 text-xs text-[#CD853F]">— Michael Faraday</span>
            </p>
          </div>
          <ActivityAnalytics />
        </div>
      )}
    </div>
  );
}

