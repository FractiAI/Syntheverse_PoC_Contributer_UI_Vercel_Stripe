'use client';

import { Microscope, Palette, Building2, Shield, Zap, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export function SectionCapabilities() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const capabilities = [
    {
      icon: Microscope,
      title: 'Frontier R&D',
      description: 'Breakthrough research evaluated and anchored permanently',
      stats: 'PhD-level evaluation in minutes',
      features: [
        'Novelty detection vs. entire archive',
        'Density scoring for information richness',
        'Coherence measurement',
        'Alignment with frontier research goals',
      ],
      cta: { label: 'Submit Research', href: '/signup?track=researcher' },
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      icon: Palette,
      title: 'Frontier Creator Worlds',
      description: 'Infinite HHF-AI materials for full-reality worldbuilding',
      stats: 'Unlimited creative substrates',
      features: [
        'Access to infinite HHF-AI materials',
        'Coherence-measured creative output',
        'Verifiable worldbuilding contributions',
        'Transform vision into on-chain records',
      ],
      cta: { label: 'Start Creating', href: '/fractiai/enterprise-dashboard' },
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      icon: Building2,
      title: 'Frontier Enterprise Scale',
      description: 'Nested sandboxes for teams and organizations',
      stats: '1.5-1.8× output, 38-58% cost reduction (simulated)',
      features: [
        'Custom evaluation parameters',
        'Team contribution tracking',
        'Nested colony architecture',
        'Resources deploy where value is created',
      ],
      cta: { label: 'Enterprise Dashboard', href: '/fractiai/enterprise-dashboard' },
      gradient: 'from-orange-600 to-red-600',
    },
  ];

  const trustedBy = [
    { icon: Shield, label: 'Blockchain-Secured', value: 'Base Mainnet' },
    { icon: Zap, label: 'Lightning Fast', value: '~10min evals' },
    { icon: Globe, label: 'Global Access', value: '24/7 availability' },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className={`mb-16 text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 backdrop-blur-xl">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span className="text-sm font-medium uppercase tracking-wider text-purple-300">
              Mission Capabilities
            </span>
          </div>
          <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
            Built for Every Mission Profile
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            From solo researchers to global enterprises, one protocol adapts to all
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <div
              key={capability.title}
              className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-xl transition-all duration-700 hover:border-slate-600 hover:bg-slate-900/50 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Gradient glow */}
              <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${capability.gradient} opacity-10 blur-3xl transition-all group-hover:opacity-20`} />

              <div className="relative p-8">
                {/* Icon */}
                <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${capability.gradient} p-4`}>
                  <capability.icon className="h-8 w-8 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="mb-3 text-2xl font-bold text-white">{capability.title}</h3>
                <p className="mb-4 text-slate-400">{capability.description}</p>

                {/* Stats */}
                <div className="mb-6 rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3">
                  <div className="text-sm font-medium text-blue-300">{capability.stats}</div>
                </div>

                {/* Features */}
                <ul className="mb-6 space-y-2">
                  {capability.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-400">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={capability.cta.href}
                  className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${capability.gradient} px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-${capability.gradient.split('-')[1]}-500/50`}
                >
                  {capability.cta.label}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className={`mt-16 grid gap-6 rounded-2xl border border-slate-700/50 bg-slate-900/30 p-8 backdrop-blur-xl md:grid-cols-3 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          style={{ transitionDelay: '600ms' }}
        >
          {trustedBy.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <item.icon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="font-semibold text-white">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

