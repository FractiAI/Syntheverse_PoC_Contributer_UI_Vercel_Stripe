/**
 * Support Hub - Unified Access to All Support & Subscription Options
 * Elegant, cockpit-style interface for financial alignment, subscriptions, and imaging support
 */

'use client';

import { useState } from 'react';
import { X, Heart, Zap, Microscope, Camera, ArrowRight, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SupportHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportHub({ isOpen, onClose }: SupportHubProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="border-b border-[var(--keyline-primary)] p-6 pb-4" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(255, 184, 77, 0.15)'}}>
                  <Sparkles className="w-6 h-6" style={{color: 'var(--hydrogen-amber)'}} />
                </div>
                <DialogTitle className="text-2xl font-bold" style={{color: 'hsl(var(--text-primary))'}}>
                  Plans & Financial Support
                </DialogTitle>
              </div>
              <p className="text-sm opacity-80 ml-11" style={{color: 'hsl(var(--text-secondary))'}}>
                Monthly access plans and one-time contributions to support the frontier
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--keyline-primary)] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plans & Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Microscope className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-beta))'}} />
              <h3 className="text-lg font-bold" style={{color: 'hsl(var(--hydrogen-beta))'}}>
                SynthScan™ & FieldScan™ Plans
              </h3>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Choose between self-service monthly access or full-service expert consulting.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* SynthScan Monthly Access */}
              <Link
                href="/synthscan/monthly-access"
                onClick={onClose}
                className="group p-5 rounded-lg border-2 border-[var(--keyline-primary)] hover:border-[var(--hydrogen-beta)] transition-all hover:shadow-lg hover:shadow-[var(--hydrogen-beta)]/20"
                style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: 'hsl(var(--hydrogen-beta) / 0.15)'}}>
                      <Microscope className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-beta))'}} />
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{color: 'hsl(var(--text-primary))'}}>SynthScan™</h4>
                      <div className="text-xs opacity-70">Self-Service Access</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm opacity-80 mb-3">
                  Monthly subscription for ongoing monitoring. You run your own scans via HHF-AI MRI. 3 tiers available.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs opacity-60">From</span>
                  <span className="text-2xl font-bold" style={{color: 'hsl(var(--hydrogen-beta))'}}>$500</span>
                  <span className="text-xs opacity-60">/node/month</span>
                </div>
              </Link>

              {/* FieldScan Expert Service */}
              <Link
                href="/fractiai/synthscan-field-imaging"
                onClick={onClose}
                className="group p-5 rounded-lg border-2 border-[var(--keyline-primary)] hover:border-[var(--hydrogen-gamma)] transition-all hover:shadow-lg hover:shadow-[var(--hydrogen-gamma)]/20"
                style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: 'hsl(var(--hydrogen-gamma) / 0.15)'}}>
                      <Camera className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-gamma))'}} />
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{color: 'hsl(var(--text-primary))'}}>FieldScan™</h4>
                      <div className="text-xs opacity-70">Expert Consulting</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm opacity-80 mb-3">
                  Full-service consulting with expert operator. We scan, interpret results, and deliver actionable insights. 3 tiers available.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs opacity-60">From</span>
                  <span className="text-2xl font-bold" style={{color: 'hsl(var(--hydrogen-gamma))'}}>$500</span>
                  <span className="text-xs opacity-60">/session</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-[var(--keyline-primary)]" />

          {/* Financial Support */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5" style={{color: 'var(--hydrogen-amber)'}} />
              <h3 className="text-lg font-bold" style={{color: 'var(--hydrogen-amber)'}}>
                Financial Support
              </h3>
            </div>
            <p className="text-sm opacity-80 mb-4">
              One-time contributions to help maintain infrastructure, advance research, and keep the protocol accessible.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { amount: '$10K', label: 'Copper' },
                { amount: '$25K', label: 'Bronze' },
                { amount: '$50K', label: 'Silver' },
                { amount: '$100K', label: 'Gold' },
                { amount: '$250K', label: 'Platinum' },
              ].map((tier, idx) => (
                <Link
                  key={tier.label}
                  href="/support"
                  onClick={onClose}
                  className={`group p-3 rounded-lg border hover:bg-[var(--hydrogen-amber)]/10 transition-all text-center ${
                    idx === 2 ? 'border-2 border-[var(--hydrogen-amber)]' : 'border-[var(--keyline-primary)]'
                  }`}
                >
                  <div className="text-sm font-bold mb-1" style={{color: 'var(--hydrogen-amber)'}}>{tier.amount}</div>
                  <div className="text-xs opacity-60">{tier.label}</div>
                </Link>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/support"
                onClick={onClose}
                className="text-sm opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-2"
              >
                View details & contribute
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-[var(--keyline-primary)]" />

          {/* Info Footer */}
          <div className="flex items-start gap-3 p-4 rounded-lg" style={{backgroundColor: 'hsl(var(--cockpit-carbon) / 0.5)'}}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
            <div className="text-xs opacity-70 space-y-1">
              <p>
                <strong>All transactions are secure</strong> and processed through Stripe. Monthly subscriptions can be canceled anytime.
              </p>
              <p>
                SYNTH token recognition (if enabled) is optional, post-hoc, and discretionary. Not an investment or security.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

