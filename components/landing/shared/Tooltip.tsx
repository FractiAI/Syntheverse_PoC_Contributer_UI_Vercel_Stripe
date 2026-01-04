'use client';

import { useState } from 'react';

interface TooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function Tooltip({ term, definition, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  return (
    <span className="relative inline-block">
      <abbr
        className="cursor-help border-b border-dotted border-current no-underline"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => !isPinned && setIsOpen(false)}
        onClick={() => setIsPinned(!isPinned)}
        title={definition}
      >
        {children}
      </abbr>

      {isOpen && (
        <span
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3 text-sm shadow-lg"
          role="tooltip"
        >
          <strong className="mb-1 block text-[var(--cockpit-text)]">{term}</strong>
          <p className="text-[var(--cockpit-text)] opacity-80">{definition}</p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPinned(!isPinned);
            }}
            className="mt-2 text-xs text-[var(--hydrogen-amber)] hover:underline"
          >
            {isPinned ? 'Unpin' : 'Pin this'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setIsPinned(false);
            }}
            className="absolute right-2 top-2 text-[var(--cockpit-text)] opacity-60 hover:opacity-100"
            aria-label="Close tooltip"
          >
            ×
          </button>
        </span>
      )}
    </span>
  );
}

