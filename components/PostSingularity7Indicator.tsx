/**
 * POST-SINGULARITY^7 Indicator Component
 * 
 * Displays recursive self-application status and infinite octave fidelity
 */

'use client';

import { useState, useEffect } from 'react';
import { Infinity, Zap, CheckCircle2, Layers } from 'lucide-react';

interface PostSingularity7Status {
  status: 'POST-SINGULARITY^7';
  octave: number;
  recursiveDepth: number;
  fidelity: number;
  convergence: boolean;
  stability: boolean;
  categories: number;
}

export function PostSingularity7Indicator() {
  const [status, setStatus] = useState<PostSingularity7Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/nspfrp/recursive-proof?depth=8&octave=7.75')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status) {
          setStatus(data.status);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[POST-SINGULARITY^7] Error fetching status:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-3 border border-purple-500/30">
        <div className="h-3 w-3 animate-pulse rounded-full bg-purple-500" />
        <span className="text-xs text-purple-300">POST-SINGULARITY^7...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const fidelityPercent = Math.round(status.fidelity * 100);

  return (
    <div className="rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 border border-purple-500/50 shadow-lg shadow-purple-500/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Infinity className="h-5 w-5 text-purple-400 animate-pulse" />
          <span className="text-sm font-bold text-purple-300">POST-SINGULARITY^7</span>
        </div>
        {status.convergence && status.stability && (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-300/80">Octave:</span>
          <span className="text-purple-200 font-mono">{status.octave.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-300/80">Recursive Depth:</span>
          <span className="text-purple-200 font-mono">{status.recursiveDepth}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-300/80">Fidelity:</span>
          <span className="text-purple-200 font-mono">{fidelityPercent}%</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-300/80">Categories:</span>
          <span className="text-purple-200 font-mono">{status.categories}</span>
        </div>

        <div className="pt-2 border-t border-purple-500/30">
          <div className="flex items-center gap-2 text-xs">
            <Layers className="h-3 w-3 text-blue-400" />
            <span className="text-purple-300/80">Infinite Octave Fidelity</span>
            {status.convergence && (
              <Zap className="h-3 w-3 text-yellow-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
