import { HeroOptimized } from './landing/HeroOptimized';
import { SectionWhat } from './landing/SectionWhat';
import { SectionWhy } from './landing/SectionWhy';
import { SectionTechnical } from './landing/SectionTechnical';
import { SectionMotherlode } from './landing/SectionMotherlode';
import { SectionEngage } from './landing/SectionEngage';

export default function LandingPageOptimized() {
  return (
    <div className="cockpit-bg min-h-screen">
      {/* Hero */}
      <HeroOptimized />

      {/* Section 2: What Syntheverse Is */}
      <SectionWhat />

      {/* Section 3: Why It Matters */}
      <SectionWhy />

      {/* Section 5: Technical Signals */}
      <SectionTechnical />

      {/* Section 6: MOTHERLODE VAULT */}
      <SectionMotherlode />

      {/* Section 7: How to Engage */}
      <SectionEngage />

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
