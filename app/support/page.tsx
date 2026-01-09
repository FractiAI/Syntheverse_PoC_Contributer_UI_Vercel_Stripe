import { FinancialAlignmentButton } from '@/components/FinancialAlignmentButton';
import { Heart, Zap, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import '../dashboard-cockpit.css';

export const metadata = {
  title: 'Support Syntheverse | Financial Alignment',
  description: 'Support the Holographic Hydrogen Fractal Frontier. Your contributions help us maintain infrastructure, advance research, and keep the protocol open & accessible.',
};

export default function SupportPage() {
  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Back Navigation */}
        <Link href="/" className="cockpit-lever inline-flex items-center gap-2 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4 p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--hydrogen-alpha) / 0.1)'}}>
            <Heart className="w-8 h-8" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{color: 'hsl(var(--text-primary))'}}>
            Support the Frontier
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto" style={{color: 'hsl(var(--text-secondary))'}}>
            Your support helps us maintain infrastructure, advance research, and keep the Holographic Hydrogen Fractal Protocol open & accessible to all.
          </p>
        </div>

        {/* Why Support Section */}
        <div className="cloud-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(var(--hydrogen-beta))'}}>
            Why Your Support Matters
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-lg border border-[var(--keyline-primary)]" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6" style={{color: 'hsl(var(--hydrogen-beta))'}} />
                <h3 className="font-semibold">Infrastructure</h3>
              </div>
              <p className="text-sm opacity-80">
                Groq API costs, blockchain gas fees, database hosting, and server maintenance for the evaluation engine.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-[var(--keyline-primary)]" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6" style={{color: 'hsl(var(--hydrogen-gamma))'}} />
                <h3 className="font-semibold">Research</h3>
              </div>
              <p className="text-sm opacity-80">
                Continued development of HHF-AI models, fractal mathematics research, and protocol improvements.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-[var(--keyline-primary)]" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
                <h3 className="font-semibold">Accessibility</h3>
              </div>
              <p className="text-sm opacity-80">
                Keeping the protocol open, ungated, and available to independent researchers worldwide.
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--keyline-primary)] pt-6">
            <h3 className="font-semibold mb-3">What Your Support Enables:</h3>
            <ul className="grid md:grid-cols-2 gap-3">
              {[
                'Free on-chain PoC registration for all qualified submissions',
                'Continued $500 submission fee (well below journal costs)',
                'Real-time SynthScan™ MRI evaluation processing',
                'Open-source protocol development',
                '24/7 system uptime and reliability',
                'Community support and documentation',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color: 'hsl(var(--hydrogen-beta))'}} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contribution Levels */}
        <div className="cloud-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(var(--hydrogen-beta))'}}>
            Choose Your Contribution Level
          </h2>
          
          <div className="mb-6">
            <FinancialAlignmentButton />
          </div>

          <div className="text-xs opacity-60 border-t border-[var(--keyline-primary)] pt-4">
            <p className="mb-2">
              <strong>Important:</strong> All contributions are voluntary. SYNTH token recognition (if enabled) is optional, post-hoc, and discretionary—separate from payment.
            </p>
            <p>
              SYNTH is a fixed-supply internal coordination marker for protocol accounting only. Not an investment, security, or financial instrument. No guaranteed value, no profit expectation.
            </p>
          </div>
        </div>

        {/* Alternative Ways to Support */}
        <div className="cloud-card p-8">
          <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(var(--hydrogen-beta))'}}>
            Other Ways to Support
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-lg border border-[var(--keyline-primary)]" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
              <h3 className="font-semibold mb-2">Submit Quality Contributions</h3>
              <p className="opacity-80">
                Every qualified PoC strengthens the ecosystem and demonstrates the protocol's value. Your research and development work is the lifeblood of Syntheverse.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-[var(--keyline-primary)]" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
              <h3 className="font-semibold mb-2">Spread the Word</h3>
              <p className="opacity-80">
                Share Syntheverse with independent researchers, frontier scientists, and creators who would benefit from ungated, verifiable contribution recognition.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-[var(--keyline-primary)]" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
              <h3 className="font-semibold mb-2">Collaborate & Build</h3>
              <p className="opacity-80">
                Create sandboxes, contribute to documentation, help onboard new contributors, or build tools that integrate with the protocol.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-sm opacity-70 mb-4">
            Thank you for supporting the Holographic Hydrogen Fractal Frontier 🌌
          </p>
          <Link href="/dashboard" className="cockpit-lever inline-flex items-center gap-2">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

