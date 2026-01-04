/**
 * Status Indicators Component
 * Shows Beta Active and Base Mainnet status across all pages
 */

'use client';

import { BootSequenceIndicators } from './BootSequenceIndicators';

export function StatusIndicators() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Beta Active Indicator */}
      <span className="cockpit-badge cockpit-badge-amber">BETA ACTIVE</span>

      {/* Base Mainnet Status - LIVE */}
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-green-500"
          style={{ boxShadow: '0 0 8px #22c55e' }}
        ></div>
        <div className="cockpit-badge">
          <span>BASE MAINNET LIVE</span>
        </div>
      </div>

      {/* Boot Sequence Indicators */}
      <div className="flex items-center gap-2 border-l border-[var(--keyline-primary)] pl-4">
        <BootSequenceIndicators />
      </div>
    </div>
  );
}
