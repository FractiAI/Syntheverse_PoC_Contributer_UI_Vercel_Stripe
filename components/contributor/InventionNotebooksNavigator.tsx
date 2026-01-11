'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Feather, ScrollText } from 'lucide-react';
import { FrontierModule } from '../FrontierModule';

interface InventionNotebooksNavigatorProps {
  userEmail: string;
}

export function InventionNotebooksNavigator({ userEmail }: InventionNotebooksNavigatorProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('davinci_invention_notebooks_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('davinci_invention_notebooks_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #DAA520',
      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Notebook/codex icon */}
              <div className="w-10 h-10 rounded-full border-2 border-[#DAA520] flex items-center justify-center bg-gradient-to-br from-[#DAA520]/20 to-transparent relative">
                <ScrollText className="h-5 w-5 text-[#DAA520]" />
                {/* Quill pen overlay */}
                <div className="absolute -top-1 -right-1">
                  <Feather className="h-4 w-4 text-[#B8860B]" style={{
                    transform: 'rotate(-45deg)',
                  }}/>
                </div>
              </div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[#DAA520] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #DAA520',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#DAA520]">
                INVENTION NOTEBOOKS
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Codex of Contributions & Discoveries
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#DAA520] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-3 bg-[#DAA520]/5 border-l-2 border-[#DAA520] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "I have been impressed with the urgency of doing. Knowing is not enough; we must apply. 
              Being willing is not enough; we must do. Where the spirit does not work with the hand, there is no art."
              <span className="block mt-2 text-xs text-[#DAA520]">— Leonardo da Vinci</span>
            </p>
          </div>
          <FrontierModule userEmail={userEmail} />
        </div>
      )}
    </div>
  );
}

