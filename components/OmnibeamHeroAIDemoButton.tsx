/**
 * Omnibeam Hero AI Demo Button
 * 
 * Tesla-style button that triggers Hero AI assistant demo
 * for the new Omnibeam 9x7 Fiberoptic State Image Encryption Protocol
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

'use client';

import { useState } from 'react';
import { Shield, Sparkles, Play, ArrowUpRight, Loader2 } from 'lucide-react';

export function OmnibeamHeroAIDemoButton() {
  const [loading, setLoading] = useState(false);
  const [demoStarted, setDemoStarted] = useState(false);

  const handleDemoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create demo prompt for Hero AI
      const demoPrompt = `Demo the new Omnibeam 9x7 Fiberoptic State Image Encryption Protocol. Explain in detail:

**Narrative Context:** This protocol belongs with the Instrumentation Core—the instrument-grade imaging system that provides measurement, monitoring, and state verification. It makes sense to include now because it extends the Instrumentation Core's measurement capabilities with state image encryption, using the same instrument-grade principles and on-chain anchoring infrastructure.

1. **Instrumentation Core Integration**: How this protocol extends the Instrumentation Core's measurement and verification capabilities
2. **9x7 Grid Extraction**: How it extracts a 9x7 grid (63 points) from uploaded images using instrument-grade measurement principles
3. **Encryption Key Derivation**: How it uses PBKDF2 with 100,000 iterations to derive 256-bit keys from image state
4. **State Image ID Generation**: How state image IDs are generated using evaluation scores (core output as input), integrating with the Instrumentation Core's output
5. **NSPFRP Integration**: How it integrates with NSPFRP State Imaging and ID Protocol
6. **On-Chain Anchoring**: How state image IDs and encryption key hashes are anchored on-chain with intentional octave separation (Octave 5 → Octave 2), following the same pattern as Instrumentation Core measurements
7. **User Flow**: Show how operators can enable this in submissions for ultimate protection

Please provide a comprehensive, technical explanation suitable for operators testing this new feature. Emphasize the connection to the Instrumentation Core and why it makes sense to include this capability now. Include code examples where relevant.`;

      // Try to trigger Hero AI with demo prompt
      // First, try to find and open Hero AI panel if available
      const event = new CustomEvent('hero-ai-demo', {
        detail: {
          prompt: demoPrompt,
          feature: 'omnibeam-9x7-fiberoptic-state-image-encryption',
          context: 'operator-console',
          autoStart: true,
        }
      });
      window.dispatchEvent(event);

      // Also try to open Hero AI panel if it exists
      const heroPanel = document.querySelector('[data-hero-panel]') as HTMLElement;
      if (heroPanel) {
        heroPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Try to trigger opening the panel
        const expandButton = heroPanel.querySelector('[data-hero-expand]') as HTMLElement;
        if (expandButton) {
          expandButton.click();
        }
      }

      // Alternatively, try to open Hero AI directly via API
      // This will work if Hero AI interface is available
      try {
        const response = await fetch('/api/hero-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: demoPrompt,
              }
            ],
            heroId: 'operator-assistant', // Default operator hero
            pageContext: 'operator-console',
            additionalContext: 'Omnibeam 9x7 Fiberoptic State Image Encryption Protocol Demo',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Hero AI Demo Response:', data);
          
          // Show success notification
          setDemoStarted(true);
          setTimeout(() => setDemoStarted(false), 3000);
        }
      } catch (apiError) {
        console.warn('Hero AI API not available, using fallback:', apiError);
      }

    } catch (error) {
      console.error('Error starting Hero AI demo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 mt-8">
      <a
        href="#"
        onClick={handleDemoClick}
        className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-amber-900/30 border-2 ${
          loading || demoStarted
            ? 'border-blue-500/70'
            : 'border-blue-400/50 hover:border-blue-300'
        } transition-all duration-300 overflow-hidden cursor-pointer`}
        style={{ boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)' }}
      >
        <div className={`absolute inset-0 ${
          loading || demoStarted
            ? 'bg-blue-500/20'
            : 'bg-blue-500/10 group-hover:bg-blue-500/20'
        } transition-colors`}></div>
        <div className="relative flex items-center gap-3">
          {loading ? (
            <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
          ) : (
            <>
              <div className="relative">
                <Shield className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors relative z-10" />
                <Sparkles className="h-3 w-3 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <Play className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </>
          )}
        </div>
        <span className={`text-lg font-bold tracking-tighter ${
          loading || demoStarted
            ? 'text-blue-200'
            : 'text-blue-300 group-hover:text-blue-200'
        } uppercase transition-colors`}>
          {loading
            ? 'Starting Hero AI Demo...'
            : demoStarted
            ? 'Demo Started - Check Hero AI Panel'
            : '🚀 Hero AI Demo: Omnibeam 9x7 Fiberoptic State Image Encryption'}
        </span>
        {!loading && (
          <ArrowUpRight className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
        )}
      </a>
      <p className="text-[10px] font-bold text-blue-500/70 uppercase tracking-[0.5em]">
        Ultimate Encryption Key · Core Output as Input · On-Chain Protection
      </p>
      <p className="text-[9px] text-slate-500 max-w-2xl">
        Click to auto-demo the new Omnibeam 9x7 Fiberoptic State Image Encryption Protocol with Hero Hosted AI Assistant. 
        Learn how images are converted to ultimate encryption keys with 9x7 grid extraction and NSPFRP state imaging protocol.
        <br />
        <span className="text-blue-400/80 font-semibold">Belongs with Instrumentation Core:</span> This protocol extends the instrument-grade measurement and verification capabilities of the Instrumentation Core, making it a natural fit for inclusion now as the core matures.
      </p>
    </div>
  );
}
