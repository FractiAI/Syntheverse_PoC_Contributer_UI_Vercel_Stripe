import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSynthScanSubscription } from '@/utils/stripe/check-synthscan-subscription';
import '../../dashboard-cockpit.css';
import '../../synthscan-control-panel.css';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Play,
  FileText,
  Download,
  Zap,
  Activity,
  Gauge,
  Radio,
  Waves,
  Monitor,
  Power,
} from 'lucide-react';
import SynthScanPricingTiers from '@/components/SynthScanPricingTiers';

export const dynamic = 'force-dynamic';

export default async function SynthScanControlPanelPage() {
  // Check authentication
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect('/login?redirect=/synthscan/control-panel');
  }

  // Check SynthScan subscription status
  const subscription = await hasActiveSynthScanSubscription(user.email);

  // If no subscription, show pricing and require subscription
  if (!subscription) {
    return (
      <div className="cockpit-bg min-h-screen">
        <div className="container mx-auto space-y-8 px-6 py-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="cockpit-lever inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="cockpit-panel border-2 border-amber-500/50 bg-amber-500/10 p-8">
            <div className="cockpit-label mb-4 text-amber-400">SYNTHSCAN™ MRI CONTROL PANEL</div>
            <div className="cockpit-title mb-4 text-2xl">Subscription Required</div>
            <div className="cockpit-text mb-6 space-y-2 text-sm">
              <p>
                <strong>Access to SynthScan™ MRI Control Panel requires a valid subscription.</strong>
              </p>
              <p>
                The Control Panel provides advanced tools for running scans, analyzing coherence,
                mapping edges, and exporting reports using hydrogen spin–mediated resonance imaging.
              </p>
              <p>
                Choose a subscription plan below to get started with SynthScan™ MRI monthly access.
              </p>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="cockpit-panel p-8">
            <div className="cockpit-label mb-4">SUBSCRIPTION PLANS</div>
            <SynthScanPricingTiers />
          </div>
        </div>
      </div>
    );
  }

  // User has active subscription - show control panel
  return (
    <div className="cockpit-bg min-h-screen" style={{ background: '#0a0e14' }}>
      <div className="container mx-auto space-y-6 px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/synthscan/monthly-access"
            className="synthscan-button inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Interface
          </Link>
          <div className="synthscan-status-indicator">
            <Power className="h-3 w-3" />
            System Online
          </div>
        </div>

        {/* Main Control Panel Header */}
        <div className="synthscan-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#88aacc', letterSpacing: '0.1em' }}
              >
                SYNTHSCAN™ MRI CONTROL SYSTEM
              </div>
              <div
                className="mt-2 text-2xl font-bold"
                style={{ color: '#ffffff', fontFamily: 'monospace' }}
              >
                Control Panel v2.1
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#88aacc' }}
              >
                Subscription
              </div>
              <div className="mt-1 font-mono text-sm" style={{ color: '#00ff88' }}>
                {subscription.tier} • {subscription.nodeCount} NODE{subscription.nodeCount > 1 ? 'S' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Main Control Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: System Status & Parameters */}
          <div className="space-y-6 lg:col-span-1">
            {/* System Status Display */}
            <div className="synthscan-panel p-4">
              <div className="synthscan-section-title">System Status</div>
              <div className="synthscan-display space-y-2">
                <div className="synthscan-parameter">
                  <span className="synthscan-parameter-label">Power</span>
                  <span className="synthscan-parameter-value">ON</span>
                </div>
                <div className="synthscan-parameter">
                  <span className="synthscan-parameter-label">Magnet</span>
                  <span className="synthscan-parameter-value">STABLE</span>
                </div>
                <div className="synthscan-parameter">
                  <span className="synthscan-parameter-label">RF System</span>
                  <span className="synthscan-parameter-value">READY</span>
                </div>
                <div className="synthscan-parameter">
                  <span className="synthscan-parameter-label">Gradient</span>
                  <span className="synthscan-parameter-value">ACTIVE</span>
                </div>
                <div className="synthscan-parameter">
                  <span className="synthscan-parameter-label">Temp</span>
                  <span className="synthscan-parameter-value">22.3°C</span>
                </div>
              </div>
            </div>

            {/* Scan Parameters */}
            <div className="synthscan-panel p-4">
              <div className="synthscan-section-title">Scan Parameters</div>
              <div className="space-y-3">
                <div className="synthscan-section">
                  <div className="synthscan-parameter">
                    <span className="synthscan-parameter-label">Frequency</span>
                    <span className="synthscan-parameter-value">42.58 MHz/T</span>
                  </div>
                  <div className="synthscan-meter mt-2">
                    <div className="synthscan-meter-fill" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="synthscan-section">
                  <div className="synthscan-parameter">
                    <span className="synthscan-parameter-label">Field Strength</span>
                    <span className="synthscan-parameter-value">1.0 T</span>
                  </div>
                  <div className="synthscan-meter mt-2">
                    <div className="synthscan-meter-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="synthscan-section">
                  <div className="synthscan-parameter">
                    <span className="synthscan-parameter-label">Edge Contrast</span>
                    <span className="synthscan-parameter-value">Cₑ = 1.62</span>
                  </div>
                  <div className="synthscan-meter mt-2">
                    <div className="synthscan-meter-fill" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Knobs */}
            <div className="synthscan-panel p-4">
              <div className="synthscan-section-title">Manual Controls</div>
              <div className="flex justify-around py-4">
                <div className="text-center">
                  <div className="synthscan-control-knob mx-auto mb-2"></div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: '#88aacc' }}>
                    Gain
                  </div>
                </div>
                <div className="text-center">
                  <div className="synthscan-control-knob mx-auto mb-2"></div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: '#88aacc' }}>
                    Contrast
                  </div>
                </div>
                <div className="text-center">
                  <div className="synthscan-control-knob mx-auto mb-2"></div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: '#88aacc' }}>
                    Depth
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Main Display & Test Example */}
          <div className="space-y-6 lg:col-span-2">
            {/* Main Display */}
            <div className="synthscan-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="synthscan-section-title">Imaging Display</div>
                <div className="flex gap-2">
                  <button className="synthscan-button text-xs">
                    <Monitor className="mr-1 inline h-3 w-3" />
                    Display
                  </button>
                  <button className="synthscan-button text-xs">
                    <Download className="mr-1 inline h-3 w-3" />
                    Export
                  </button>
                </div>
              </div>
              <div className="synthscan-display" style={{ minHeight: '400px' }}>
                <div className="synthscan-readout space-y-2">
                  <div>
                    <strong>SYNTHSCAN™ MRI v2.1</strong> - Hydrogen Spin Resonance Imaging
                  </div>
                  <div>System: HHF-AI Coherence Analysis</div>
                  <div>Status: Ready for scan</div>
                  <div className="mt-4">
                    <div className="synthscan-section-title mb-2">Test Example Configuration</div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Target:</strong> Holographic Hydrogen Fractal (HHF) boundary structure
                      </div>
                      <div>
                        <strong>Resonance:</strong> 42.58 MHz/T (hydrogen spin)
                      </div>
                      <div>
                        <strong>Edge Contrast:</strong> Cₑ ≈ 1.62 ± 0.07
                      </div>
                      <div>
                        <strong>Coherence Depth:</strong> 3 nested layers
                      </div>
                      <div>
                        <strong>Output:</strong> JSON + visualization + PoC-ready data
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="synthscan-button synthscan-button-primary inline-flex items-center">
                      <Play className="mr-2 h-4 w-4" />
                      Initialize Test Scan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Functions */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="synthscan-panel p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Radio className="h-4 w-4" style={{ color: '#00ff88' }} />
                  <div className="synthscan-section-title">RF Control</div>
                </div>
                <div className="synthscan-readout text-xs mb-3">
                  Radio frequency system control and resonance tuning
                </div>
                <button className="synthscan-button w-full text-xs">Configure RF</button>
              </div>

              <div className="synthscan-panel p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Waves className="h-4 w-4" style={{ color: '#00ff88' }} />
                  <div className="synthscan-section-title">Gradient Control</div>
                </div>
                <div className="synthscan-readout text-xs mb-3">
                  Spatial encoding and gradient field management
                </div>
                <button className="synthscan-button w-full text-xs">Set Gradients</button>
              </div>

              <div className="synthscan-panel p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" style={{ color: '#00ff88' }} />
                  <div className="synthscan-section-title">Sequence Control</div>
                </div>
                <div className="synthscan-readout text-xs mb-3">
                  Pulse sequence programming and timing
                </div>
                <button className="synthscan-button w-full text-xs">Edit Sequence</button>
              </div>
            </div>

            {/* Scan History */}
            <div className="synthscan-panel p-4">
              <div className="synthscan-section-title mb-4">Scan History</div>
              <div className="synthscan-display" style={{ minHeight: '150px' }}>
                <div className="synthscan-readout text-xs">
                  <div className="mb-2">
                    <strong>No scans recorded</strong>
                  </div>
                  <div style={{ opacity: 0.6 }}>
                    Initialize a scan to begin recording history
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Subscription & Settings */}
        <div className="synthscan-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="synthscan-section-title mb-1">Subscription Status</div>
              <div className="synthscan-readout text-sm">
                <strong>{subscription.tier}</strong> • {subscription.nodeCount} node{subscription.nodeCount > 1 ? 's' : ''} active
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/billing-portal" className="synthscan-button inline-flex items-center text-xs">
                <Settings className="mr-2 h-3 w-3" />
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

