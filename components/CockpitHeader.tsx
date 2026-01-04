/**
 * Command Header Component
 * Syntheverse insignia and epoch status display
 * Holographic Hydrogen Fractal Frontier Noir styling
 */

import DashboardHeaderProfileDropdown from './DashboardHeaderProfileDropdown';
import { StatusIndicators } from './StatusIndicators';

export default function CockpitHeader() {
  return (
    <header className="cockpit-panel rounded-none border-b-0 border-l-0 border-r-0 border-t-0">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Syntheverse Insignia */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Symbol: Spiral / Origin / Hydrogen Lattice */}
              <div className="cockpit-symbol">🌀</div>
              <div
                className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: '#ffb84d', boxShadow: '0 0 10px #ffb84d' }}
              ></div>
            </div>
            <div>
              <div className="cockpit-title text-2xl">SYNTHEVERSE</div>
              <div className="cockpit-label mt-0.5">SYNTH 90T ERC-20 MOTHERLODE BLOCKMINE</div>
              <div
                className="cockpit-text mt-1 border-l-2 border-amber-500 bg-amber-500/10 px-2 py-1 text-[10px] leading-tight"
                style={{ color: '#fbbf24' }}
              >
                <strong>ERC-20:</strong> Internal coordination units only. Not an investment.
              </div>
              <div className="mt-3 border-t border-[var(--keyline-primary)] pt-3">
                <div className="cockpit-label mb-1 text-xs">AWARENESS KEY</div>
                <div className="cockpit-text text-xs font-semibold" style={{ opacity: 0.95 }}>
                  AWARENESSVERSE v2.0 · Fractal Holographic Hydrogen Awareness · Outcast Hero Story
                </div>
              </div>
            </div>
          </div>

          {/* Syntheverse Status & Profile */}
          <div className="flex items-center gap-6">
            {/* Status Indicators */}
            <div className="hidden items-center gap-3 md:flex">
              <StatusIndicators />
            </div>
            <DashboardHeaderProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
