import { HeroOptimized } from './landing/HeroOptimized';
import { SectionExecutiveSummary } from './landing/SectionExecutiveSummary';
import { SectionWhy } from './landing/SectionWhy';
import { SectionTechnical } from './landing/SectionTechnical';
import { SectionMotherlode } from './landing/SectionMotherlode';
import { SectionEngage } from './landing/SectionEngage';
import { FinancialSupportBanner } from './FinancialSupportBanner';

export default function LandingPageOptimized() {
  return (
    <div className="cockpit-bg min-h-screen">
      {/* Hero */}
      <HeroOptimized />

      {/* Section 2: Executive Summary - Value Propositions */}
      <SectionExecutiveSummary />

      {/* Section 3: Why It Matters */}
      <SectionWhy />

      {/* Section 5: Technical Signals */}
      <SectionTechnical />

      {/* Section 6: MOTHERLODE VAULT */}
      <SectionMotherlode />

      {/* Section 7: How to Engage */}
      <SectionEngage />

      {/* Financial Support Banner */}
      <div className="container mx-auto px-6 py-12">
        <FinancialSupportBanner variant="full" />
      </div>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
