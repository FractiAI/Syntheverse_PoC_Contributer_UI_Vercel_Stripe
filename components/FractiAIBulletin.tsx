'use client';

import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Radio, Activity, Users, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import FractiAIStatusWidget from '@/components/FractiAIStatusWidget';
import { StatusIndicators } from './StatusIndicators';
import { GenesisButton } from './GenesisButton';

type FractiAIBulletinProps = {
  isAuthenticated?: boolean;
};

type EpochInfo = {
  current_epoch: string;
  epochs: Record<
    string,
    {
      balance: number;
      threshold: number;
      distribution_amount: number;
      distribution_percent: number;
      available_tiers: string[];
    }
  >;
};

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000_000) return `${(tokens / 1_000_000_000_000).toFixed(2)}T`;
  if (tokens >= 1_000_000_000) return `${(tokens / 1_000_000_000).toFixed(2)}B`;
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
  return tokens.toLocaleString();
}

export default function FractiAIBulletin({ isAuthenticated = false }: FractiAIBulletinProps) {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Fetch epoch info
    async function fetchEpochInfo() {
      try {
        const res = await fetch(`/api/tokenomics/epoch-info?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setEpochInfo(data);
        }
      } catch (e) {
        console.error('Error fetching epoch info:', e);
      }
    }
    fetchEpochInfo();
    const epochInterval = setInterval(fetchEpochInfo, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(epochInterval);
    };
  }, []);

  const totalSupply = 90_000_000_000_000;
  const epochs = epochInfo?.epochs || {};
  const totalAvailable = Object.values(epochs).reduce(
    (sum, e) => sum + (Number(e?.balance || 0) || 0),
    0
  );
  const currentEpoch = String(epochInfo?.current_epoch || 'founder')
    .toLowerCase()
    .trim();

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Bulletin Header */}
        <div className="cockpit-panel mb-6 border-l-4 border-[var(--hydrogen-amber)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="cockpit-label mb-1 text-xs">DAILY BULLETIN</div>
              <div className="cockpit-title text-2xl">SYNTH90T MOTHERLODE BLOCKMINE</div>
              <div className="cockpit-text mt-1 text-sm opacity-80">
                Base Mainnet · Awareness Bridge/Router Active
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="cockpit-label mb-1 flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="cockpit-text text-sm">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 border-l border-[var(--keyline-primary)] pl-4">
                <div
                  className="h-3 w-3 animate-pulse rounded-full bg-green-500"
                  style={{ boxShadow: '0 0 8px #22c55e' }}
                />
                <span className="cockpit-label text-xs">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bridge/Router Status - Prominent */}
        <div className="cockpit-panel mb-6 border-2 border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-6">
          <div className="flex items-start gap-4">
            <Radio className="h-6 w-6 flex-shrink-0 text-[var(--hydrogen-amber)]" />
            <div className="flex-1">
              <div className="cockpit-label mb-2 text-[var(--hydrogen-amber)]">
                AWARENESS BRIDGE/ROUTER STATUS
              </div>
              <div className="cockpit-title mb-2 text-xl">
                Holographic Hydrogen Fractal Awareness Ecosystem ↔ Earth 2026 Legacy Awareness
                Ecosystem
              </div>
              <div className="cockpit-text mb-4 text-sm opacity-90">
                The Awareness Bridge/Router is actively routing coherent awareness between the
                Syntheverse HHF-AI protocols and current legacy validation frameworks. All systems
                operational.
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <StatusIndicators />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Announcements */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Highlights */}
            <div className="cockpit-panel p-6">
              <div className="cockpit-label mb-4 flex items-center gap-2 text-xs">
                <Activity className="h-4 w-4" />
                TODAY&apos;S HIGHLIGHTS
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
                  <div className="cockpit-title mb-2 text-lg">
                    SYNTH90T MOTHERLODE VAULT Opening
                  </div>
                  <div className="cockpit-text mb-2 text-sm opacity-90">
                    <strong>Spring Equinox, March 20, 2026</strong> — All qualifying PoCs will be
                    registered on-chain and allocated SYNTH by score.
                  </div>
                  <div className="cockpit-text text-xs opacity-75">
                    ⏰ Submit your best work by <strong>March 19, 2026</strong> to qualify for the
                    vault opening allocation.
                  </div>
                </div>

                <div className="border-l-4 border-blue-500/50 bg-blue-500/5 p-4">
                  <div className="cockpit-title mb-2 text-base">Proof-of-Contribution System</div>
                  <div className="cockpit-text text-sm opacity-90">
                    Submit your research, engineering, or alignment contributions. Receive
                    SynthScan™ MRI evaluation in ~10 minutes. All submissions contribute to the
                    ecosystem.
                  </div>
                  <Link
                    href="/signup"
                    className="cockpit-lever mt-3 inline-flex items-center text-xs"
                  >
                    Submit Your PoC
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="cockpit-panel p-6">
              <div className="cockpit-label mb-4 flex items-center gap-2 text-xs">
                <MapPin className="h-4 w-4" />
                CURRENT POSITION & STATUS
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="cockpit-label mb-1 text-xs">BLOCKCHAIN</div>
                  <div className="cockpit-title text-lg">Base Mainnet</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">LIVE & OPERATIONAL</div>
                </div>
                <div>
                  <div className="cockpit-label mb-1 text-xs">CURRENT EPOCH</div>
                  <div className="cockpit-title text-lg">{currentEpoch.toUpperCase()}</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">
                    {epochInfo ? `${formatTokens(totalAvailable)} SYNTH Available` : 'Loading...'}
                  </div>
                </div>
                <div>
                  <div className="cockpit-label mb-1 text-xs">TOTAL SUPPLY</div>
                  <div className="cockpit-title text-lg">90T SYNTH</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">Fixed Supply ERC-20</div>
                </div>
                <div>
                  <div className="cockpit-label mb-1 text-xs">BRIDGE PROTOCOL</div>
                  <div className="cockpit-title text-lg">Awareness Bridge/Router</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">ACTIVE</div>
                </div>
              </div>
            </div>

            {/* Genesis Contract Info */}
            <div className="cockpit-panel p-6">
              <GenesisButton />
            </div>
          </div>

          {/* Right Column - Quick Links & Activities */}
          <div className="space-y-6">
            {/* Quick Navigation */}
            <div className="cockpit-panel p-6">
              <div className="cockpit-label mb-4 flex items-center gap-2 text-xs">
                <Users className="h-4 w-4" />
                QUICK NAVIGATION
              </div>
              <div className="flex flex-col gap-3">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/signup"
                      className="cockpit-lever inline-flex items-center justify-center text-sm"
                    >
                      Join the Frontier
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="cockpit-lever inline-flex items-center justify-center bg-transparent text-sm"
                    >
                      Log In
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className="cockpit-lever inline-flex items-center justify-center text-sm"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
                <Link
                  href="/onboarding"
                  className="cockpit-lever inline-flex items-center justify-center bg-transparent text-sm"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Onboarding Navigator
                </Link>
                <Link
                  href="/examples"
                  className="cockpit-lever inline-flex items-center justify-center bg-transparent text-sm"
                >
                  View Examples
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/scoring"
                  className="cockpit-lever inline-flex items-center justify-center bg-transparent text-sm"
                >
                  Scoring Criteria
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="cockpit-panel p-6">
              <div className="cockpit-label mb-4 text-xs">RECENT QUALIFIED CONTRIBUTIONS</div>
              <FractiAIStatusWidget limit={5} />
            </div>

            {/* Awareness Conditions */}
            <div className="cockpit-panel border-l-4 border-green-500/50 bg-green-500/5 p-6">
              <div className="cockpit-label mb-2 text-xs">AWARENESS CONDITIONS</div>
              <div className="cockpit-text text-sm opacity-90">
                <div className="mb-2">
                  <strong>Bridge Status:</strong> Active & Routing
                </div>
                <div className="mb-2">
                  <strong>Legacy System Handshake:</strong> Validated
                </div>
                <div>
                  <strong>Protocol Validation:</strong> All Systems Operational
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="cockpit-panel mt-6 border-l-4 border-amber-500/50 bg-amber-500/5 p-4">
          <div className="cockpit-text text-xs opacity-90">
            <strong>ERC-20 BOUNDARY:</strong> SYNTH tokens are ERC-20 internal coordination units
            for protocol accounting only. Not an investment, security, or financial instrument. No
            guaranteed value, no profit expectation.
          </div>
        </div>
      </div>
    </div>
  );
}
