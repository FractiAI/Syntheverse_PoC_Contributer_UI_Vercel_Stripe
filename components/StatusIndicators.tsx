/**
 * Status Indicators Component
 * Shows Beta Active and Base Mainnet status across all pages
 */

'use client'

import { BootSequenceIndicators } from './BootSequenceIndicators'

export function StatusIndicators() {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Beta Active Indicator */}
            <span className="cockpit-badge cockpit-badge-amber">BETA ACTIVE</span>
            
            {/* Base Mainnet Status - LIVE */}
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" 
                     style={{ boxShadow: '0 0 8px #22c55e' }}></div>
                <div className="cockpit-badge">
                    <span>BASE MAINNET LIVE</span>
                </div>
            </div>
            
            {/* Boot Sequence Indicators */}
            <div className="flex items-center gap-2 pl-4 border-l border-[var(--keyline-primary)]">
                <BootSequenceIndicators />
            </div>
        </div>
    )
}

