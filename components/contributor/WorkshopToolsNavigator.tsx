'use client';

import { useState, useEffect } from 'react';
import { Wrench, Cog, Hammer } from 'lucide-react';
import { CloudNavigator } from '../CloudNavigator';
import { WorkChatNavigator } from '../WorkChatNavigator';

interface WorkshopToolsNavigatorProps {
  userEmail: string;
  isCreator: boolean;
  isOperator: boolean;
}

export function WorkshopToolsNavigator({ userEmail, isCreator, isOperator }: WorkshopToolsNavigatorProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('davinci_workshop_tools_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('davinci_workshop_tools_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #8B4513',
      background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Workshop tools icon */}
              <div className="w-10 h-10 rounded-full border-2 border-[#8B4513] flex items-center justify-center bg-gradient-to-br from-[#8B4513]/20 to-transparent relative">
                <Wrench className="h-5 w-5 text-[#8B4513]" />
                {/* Gear overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <Cog className="h-6 w-6 text-[#D2691E]" style={{
                    animation: 'spin 8s linear infinite',
                  }}/>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#8B4513] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #8B4513',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#8B4513]">
                WORKSHOP TOOLS
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Instruments of Creation & Collaboration
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#8B4513] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-3 bg-[#8B4513]/5 border-l-2 border-[#8B4513] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "Simplicity is the ultimate sophistication. Art is never finished, only abandoned. 
              The artist sees what others only catch a glimpse of."
              <span className="block mt-2 text-xs text-[#8B4513]">— Leonardo da Vinci</span>
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-[#8B4513] mb-2 uppercase tracking-wide">Cloud Navigator</h4>
              <CloudNavigator userEmail={userEmail} isCreator={isCreator} isOperator={isOperator} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#8B4513] mb-2 uppercase tracking-wide">WorkChat</h4>
              <WorkChatNavigator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

