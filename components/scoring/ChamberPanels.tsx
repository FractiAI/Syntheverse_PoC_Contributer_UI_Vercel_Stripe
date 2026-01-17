/**
 * Chamber A/B Panels Component
 * 
 * Displays Chamber A (Meaning/Narrative) vs Chamber B (Physics/Testability)
 * based on BridgeSpec validation and T-B checks
 * 
 * NSPFRP: Single source of truth for chamber classification UI
 */

'use client';

import { Card } from '../landing/shared/Card';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { sanitizeNarrative } from '@/utils/narrative/sanitizeNarrative';

type ChamberAPanelProps = {
  hasNarrative: boolean;
  narrative?: string;
  title?: string;
};

type ChamberBPanelProps = {
  hasBridgeSpec: boolean;
  bridgeSpecValid?: boolean;
  tbResult?: {
    T_B_01?: 'passed' | 'failed' | 'not_checked';
    T_B_02?: 'passed' | 'failed' | 'not_checked';
    T_B_03?: 'passed' | 'failed' | 'not_checked';
    T_B_04?: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
    overall?: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
    testabilityScore?: number;
    degeneracyPenalty?: number;
  };
  bridgeSpec?: any;
  bridgespecHash?: string;
};

type BubbleClassDisplayProps = {
  precision?: {
    n_hat?: number;
    bubble_class?: string;
    epsilon?: number;
    coherence?: number;
    c?: number;
    penalty_inconsistency?: number;
    tier?: 'Copper' | 'Silver' | 'Gold' | 'Community';
  };
};

/**
 * Chamber A Panel - Meaning/Narrative
 * All submissions have a narrative component
 */
export function ChamberAPanel({ hasNarrative, narrative, title }: ChamberAPanelProps) {
  return (
    <Card hover={false} className="border-l-4 border-blue-500/50 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        <h3 className="text-lg font-semibold text-slate-800">Chamber A: Meaning / Narrative</h3>
        {hasNarrative && (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
      </div>
      <p className="text-sm text-slate-600 mb-3">
        Text-based narrative describing the PoC contribution. This is the "what" and "why" of your submission.
      </p>
      {title && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <div className="text-xs font-semibold text-blue-900 mb-1">Submission Title</div>
          <div className="text-sm text-blue-800">{title}</div>
        </div>
      )}
      {narrative && (
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 max-h-48 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-900 mb-1">Narrative Preview (NON-AUDITED)</div>
          <div className="mb-2 rounded bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
            ⚠️ Text-only narrative. Numeric claims and JSON removed per AAC-1 Option A.
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {(() => {
              const sanitized = sanitizeNarrative(narrative);
              return sanitized.substring(0, 500) + (sanitized.length > 500 ? '...' : '');
            })()}
          </p>
        </div>
      )}
    </Card>
  );
}

/**
 * Chamber B Panel - Physics/Testability
 * Requires valid BridgeSpec for "official" status
 */
export function ChamberBPanel({ 
  hasBridgeSpec, 
  bridgeSpecValid, 
  tbResult,
  bridgeSpec,
  bridgespecHash 
}: ChamberBPanelProps) {
  if (!hasBridgeSpec) {
    return (
      <Card hover={false} className="border-l-4 border-amber-500/50 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
          <h3 className="text-lg font-semibold text-slate-800">Chamber B: Physics / Testability</h3>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-sm text-slate-600 mb-3">
          <strong>Status:</strong> No BridgeSpec provided. This submission is "community" status only.
        </p>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <div className="text-xs font-semibold text-amber-900 mb-1">
            ⚠️ Official Status Requirements
          </div>
          <p className="text-sm text-amber-800">
            To qualify for "official" status, provide a BridgeSpec that translates your narrative claims into testable predictions with:
          </p>
          <ul className="mt-2 ml-4 text-sm text-amber-800 list-disc space-y-1">
            <li>Regime declaration (e.g., EM/Maxwell, plasma/MHD)</li>
            <li>Observables to measure</li>
            <li>Differential predictions (non-tautological)</li>
            <li>Explicit failure conditions (falsifiable)</li>
          </ul>
        </div>
      </Card>
    );
  }

  const overallStatus = tbResult?.overall || 'not_checked';
  const isOfficial = overallStatus === 'passed';
  const isSoftFailed = overallStatus === 'soft_failed';

  return (
    <Card hover={false} className={`border-l-4 mb-4 ${
      isOfficial ? 'border-green-500/50' : 
      isSoftFailed ? 'border-yellow-500/50' : 
      'border-red-500/50'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-2 w-2 rounded-full ${
          isOfficial ? 'bg-green-500' : 
          isSoftFailed ? 'bg-yellow-500' : 
          'bg-red-500'
        }`}></div>
        <h3 className="text-lg font-semibold text-slate-800">Chamber B: Physics / Testability</h3>
        {isOfficial ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : isSoftFailed ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
      
      <div className="mb-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold ${
          isOfficial ? 'bg-green-100 text-green-800' : 
          isSoftFailed ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {isOfficial ? '✅ Official Status Eligible' : 
           isSoftFailed ? '⚠️ Soft-Fail (Degeneracy Warnings)' : 
           '❌ Community Status Only'}
        </div>
      </div>

      {tbResult && (
        <div className="space-y-2 mb-3">
          {/* T-B-01: Regime + Observables */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <span className="text-sm text-slate-700">T-B-01: Regime + Observables</span>
            <div className="flex items-center gap-2">
              {tbResult.T_B_01 === 'passed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : tbResult.T_B_01 === 'failed' ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-600">
                {tbResult.T_B_01 === 'passed' ? 'PASSED' : 
                 tbResult.T_B_01 === 'failed' ? 'FAILED' : 
                 'NOT CHECKED'}
              </span>
            </div>
          </div>

          {/* T-B-02: Differential Prediction */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <span className="text-sm text-slate-700">T-B-02: Differential Prediction</span>
            <div className="flex items-center gap-2">
              {tbResult.T_B_02 === 'passed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : tbResult.T_B_02 === 'failed' ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-600">
                {tbResult.T_B_02 === 'passed' ? 'PASSED' : 
                 tbResult.T_B_02 === 'failed' ? 'FAILED' : 
                 'NOT CHECKED'}
              </span>
            </div>
          </div>

          {/* T-B-03: Failure Condition */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <span className="text-sm text-slate-700">T-B-03: Failure Condition</span>
            <div className="flex items-center gap-2">
              {tbResult.T_B_03 === 'passed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : tbResult.T_B_03 === 'failed' ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-600">
                {tbResult.T_B_03 === 'passed' ? 'PASSED' : 
                 tbResult.T_B_03 === 'failed' ? 'FAILED' : 
                 'NOT CHECKED'}
              </span>
            </div>
          </div>

          {/* T-B-04: Degeneracy (Soft-Fail) */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <span className="text-sm text-slate-700">T-B-04: Degeneracy Checks</span>
            <div className="flex items-center gap-2">
              {tbResult.T_B_04 === 'passed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : tbResult.T_B_04 === 'soft_failed' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : tbResult.T_B_04 === 'failed' ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Clock className="h-4 w-4 text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-600">
                {tbResult.T_B_04 === 'passed' ? 'PASSED' : 
                 tbResult.T_B_04 === 'soft_failed' ? 'SOFT-FAIL' : 
                 tbResult.T_B_04 === 'failed' ? 'FAILED' : 
                 'NOT CHECKED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {tbResult?.testabilityScore !== undefined && (
        <div className="mb-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-900">Testability Score</span>
            <span className="text-sm font-bold text-slate-800">
              {(tbResult.testabilityScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                tbResult.testabilityScore >= 0.8 ? 'bg-green-500' :
                tbResult.testabilityScore >= 0.5 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${tbResult.testabilityScore * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {bridgespecHash && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
          <div className="text-xs font-semibold text-slate-900 mb-1">BridgeSpec Hash</div>
          <code className="text-xs text-slate-600 font-mono break-all">
            {bridgespecHash.substring(0, 32)}...
          </code>
        </div>
      )}
    </Card>
  );
}

/**
 * BubbleClass Display - Shows n̂ (BMP precision), bubble_class, tier
 */
export function BubbleClassDisplay({ precision }: BubbleClassDisplayProps) {
  if (!precision) {
    return null;
  }

  const { n_hat, bubble_class, tier, epsilon, coherence, c, penalty_inconsistency } = precision;

  // Tier colors
  const tierColors = {
    Gold: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    Silver: 'bg-slate-100 text-slate-800 border-slate-500',
    Copper: 'bg-amber-100 text-amber-800 border-amber-500',
    Community: 'bg-blue-100 text-blue-800 border-blue-500',
  };

  return (
    <Card hover={false} className="border-l-4 border-purple-500/50 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
        <h3 className="text-lg font-semibold text-slate-800">BMP Precision (n̂)</h3>
      </div>
      <p className="text-sm text-slate-600 mb-3">
        Bubble Model of Precision: Logarithmic stability index derived from coherence and BridgeSpec quality.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Main Display: n̂ and Bubble Class */}
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-4">
          <div className="text-xs font-semibold text-purple-900 mb-2">Precision Index (n̂)</div>
          <div className="text-3xl font-bold text-purple-800 mb-1">
            {n_hat !== undefined ? n_hat.toFixed(2) : 'N/A'}
          </div>
          <div className="text-sm text-purple-700">
            Bubble Class: <strong className="font-mono">{bubble_class || 'N/A'}</strong>
          </div>
        </div>

        {/* Tier Display */}
        <div className={`rounded-lg border-2 p-4 ${tierColors[tier || 'Community']}`}>
          <div className="text-xs font-semibold mb-2">Tier Classification</div>
          <div className="text-2xl font-bold mb-1">
            {tier || 'Community'}
          </div>
          <div className="text-xs opacity-75">
            {tier === 'Gold' && 'n̂ ≥ 10 (Highest precision)'}
            {tier === 'Silver' && '6 ≤ n̂ < 10 (High precision)'}
            {tier === 'Copper' && '3 ≤ n̂ < 6 (Moderate precision)'}
            {tier === 'Community' && 'n̂ < 3 (Baseline precision)'}
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
        <div className="text-xs font-semibold text-slate-900 mb-2">Technical Details</div>
        <div className="grid gap-2 text-xs text-slate-700">
          <div className="flex justify-between">
            <span>Coherence:</span>
            <span className="font-mono">{coherence?.toFixed(0) || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Normalized (c):</span>
            <span className="font-mono">{c !== undefined ? c.toFixed(4) : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Epsilon (ε):</span>
            <span className="font-mono">{epsilon !== undefined ? epsilon.toFixed(6) : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Inconsistency Penalty:</span>
            <span className="font-mono">{penalty_inconsistency !== undefined ? penalty_inconsistency.toFixed(4) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

