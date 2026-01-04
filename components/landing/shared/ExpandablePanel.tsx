'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ExpandablePanelProps {
  label: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ExpandablePanel({
  label,
  title,
  defaultOpen = false,
  children,
  className = '',
}: ExpandablePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`cockpit-panel overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-[var(--cockpit-carbon)]"
        aria-expanded={isOpen}
      >
        <div>
          <div className="cockpit-label text-xs uppercase tracking-wider">{label}</div>
          <div className="cockpit-title mt-2 text-xl">{title}</div>
        </div>
        <ChevronDown
          className={`mt-1 h-5 w-5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="animate-fadeIn px-6 pb-6">
          <div className="cockpit-text space-y-4 text-sm">{children}</div>
        </div>
      )}
    </div>
  );
}
