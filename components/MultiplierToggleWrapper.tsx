import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MultiplierToggle to prevent SSR issues
const MultiplierToggle = dynamic(() => import('./MultiplierToggle').then(mod => ({ default: mod.MultiplierToggle })), {
  ssr: false,
  loading: () => (
    <div className="cockpit-panel p-4 animate-pulse border-l-4 border-amber-500/50">
      <div className="h-32 bg-gray-700/20 rounded"></div>
    </div>
  ),
});

export function MultiplierToggleWrapper() {
  return (
    <Suspense fallback={
      <div className="cockpit-panel p-4 animate-pulse border-l-4 border-amber-500/50">
        <div className="h-32 bg-gray-700/20 rounded"></div>
      </div>
    }>
      <MultiplierToggle />
    </Suspense>
  );
}

