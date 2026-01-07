/**
 * Persistent Details Component
 * A <details> element that remembers its open/closed state in localStorage
 */

'use client';

import { useRef, useEffect, ReactNode } from 'react';

interface PersistentDetailsProps {
  storageKey: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function PersistentDetails({
  storageKey,
  defaultOpen = true,
  children,
  className = '',
}: PersistentDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const details = detailsRef.current;
    
    // Only run once on mount
    if (isInitializedRef.current || !details) return;
    isInitializedRef.current = true;

    // Load state from localStorage
    try {
      const stored = localStorage.getItem(`panel-${storageKey}`);
      if (stored !== null) {
        details.open = stored === 'true';
      }
    } catch (e) {
      // Ignore localStorage errors (e.g., in private mode)
    }

    // Save state on toggle
    const handleToggle = () => {
      if (details) {
        try {
          localStorage.setItem(`panel-${storageKey}`, String(details.open));
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    };

    details.addEventListener('toggle', handleToggle);

    return () => {
      details.removeEventListener('toggle', handleToggle);
    };
  }, [storageKey]);

  return (
    <details ref={detailsRef} open={defaultOpen} className={className}>
      {children}
    </details>
  );
}

