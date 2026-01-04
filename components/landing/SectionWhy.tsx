import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { Card } from './shared/Card';

export function SectionWhy() {
  return (
    <SectionWrapper id="why-it-matters" eyebrow="THE PROBLEM" title="Why Syntheverse Exists">
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Problem */}
        <Card hover={false} className="border-l-4 border-red-500/50">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
            <div>
              <h3 className="cockpit-title mb-2 text-base">The Problem</h3>
              <p className="cockpit-text text-sm opacity-80">
                Frontier research lacks fast, neutral evaluation and provenance. Institutional
                gatekeeping delays or blocks non-mainstream work.
              </p>
            </div>
          </div>
        </Card>

        {/* Consequence */}
        <Card hover={false} className="border-l-4 border-amber-500/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-500" />
            <div>
              <h3 className="cockpit-title mb-2 text-base">The Cost</h3>
              <p className="cockpit-text text-sm opacity-80">
                Good work gets ignored. Redundant work wastes cycles. Independent researchers have
                no verification path.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Solution - Full Width */}
      <Card hover={false} className="border-2 border-green-500/50 bg-green-500/5">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
          <div className="flex-1">
            <h3 className="cockpit-title mb-2 text-base">The Solution</h3>
            <p className="cockpit-text text-sm opacity-80">
              SynthScan™ MRI scores contributions objectively (novelty, density, coherence,
              alignment). Redundancy detection prevents overlap. On-chain anchoring provides
              permanent provenance.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex justify-center">
        <button className="cockpit-lever inline-flex items-center gap-2 text-sm">
          See Scoring Criteria
        </button>
      </div>
    </SectionWrapper>
  );
}
