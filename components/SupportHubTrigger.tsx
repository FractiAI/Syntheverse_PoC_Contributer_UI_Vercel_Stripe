/**
 * Support Hub Trigger - Beautiful floating button to access support options
 * Can be placed in navigation or as a prominent CTA
 */

'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SupportHub } from './SupportHub';

interface SupportHubTriggerProps {
  variant?: 'button' | 'nav' | 'floating';
  label?: string;
}

export function SupportHubTrigger({ variant = 'button', label = 'Support & Access' }: SupportHubTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'nav') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="cockpit-lever inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold relative overflow-hidden group"
          style={{
            backgroundColor: 'hsl(var(--hydrogen-alpha))',
            color: '#fff',
          }}
        >
          {/* Animated glow effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
            }}
          />
          <Sparkles className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{label}</span>
        </button>
        <SupportHub isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all hover:scale-110 group"
          style={{
            backgroundColor: 'hsl(var(--hydrogen-alpha))',
            boxShadow: '0 4px 20px rgba(255, 77, 166, 0.4)',
          }}
          aria-label="Open Support Hub"
        >
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </button>
        <SupportHub isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cockpit-lever inline-flex items-center gap-2 px-6 py-3 font-semibold"
        style={{
          backgroundColor: 'hsl(var(--hydrogen-alpha))',
          color: '#fff',
        }}
      >
        <Sparkles className="w-5 h-5" />
        {label}
      </button>
      <SupportHub isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

