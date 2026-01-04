import { HeroOptimized } from './landing/HeroOptimized';
import { SectionWhat } from './landing/SectionWhat';
import { SectionWhy } from './landing/SectionWhy';
import { SectionHow } from './landing/SectionHow';
import { SectionTechnical } from './landing/SectionTechnical';
import { SectionToken } from './landing/SectionToken';
import { SectionMotherlode } from './landing/SectionMotherlode';
import { SectionProof } from './landing/SectionProof';
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

      {/* Section 4: How It Works */}
      <SectionHow />

      {/* Section 5: Technical Signals */}
      <SectionTechnical />

      {/* Section 6: Token & Sandbox */}
      <SectionToken />

      {/* Section 7: MOTHERLODE VAULT */}
      <SectionMotherlode />

      {/* Section 8: Proof & Papers */}
      <SectionProof />

      {/* Section 9: How to Engage */}
      <SectionEngage />

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}

