import LandingPageOptimized from '@/components/LandingPageOptimized';
import './dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Syntheverse: Proof-of-Contribution for Frontier Research',
  description:
    'Turn research into verifiable on-chain records. No gatekeeping, measured by coherence. Submit your PoC and receive SynthScan™ MRI evaluation.',
};

export default async function LandingPage() {
  return <LandingPageOptimized />;
}

