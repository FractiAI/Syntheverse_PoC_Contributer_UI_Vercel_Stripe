'use client';

import { FileText, BarChart3, Link as LinkIcon, Database } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function SectionMissionBrief() {
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

  const steps = [
    {
      icon: FileText,
      title: 'Submit',
      description: 'Abstract + equations + constants',
      detail: 'Up to 4000 characters',
    },
    {
      icon: BarChart3,
      title: 'Evaluate',
      description: 'AI scores via SynthScan™ MRI',
      detail: 'Novelty, Density, Coherence, Alignment',
    },
    {
      icon: Database,
      title: 'Archive',
      description: 'Vector-searchable in sandbox',
      detail: 'Comparable against all submissions',
    },
    {
      icon: LinkIcon,
      title: 'Anchor',
      description: 'Register proof on Base',
      detail: 'Permanent on-chain record',
    },
  ];

  return (
    <section
      id="mission-brief"
      ref={sectionRef}
      className="relative overflow-hidden bg-slate-950 py-24"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className={`mb-16 text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 backdrop-blur-xl">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-sm font-medium uppercase tracking-wider text-blue-300">
              Mission Brief
            </span>
          </div>
          <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
            Four-Stage Protocol
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            From submission to permanent on-chain record in minutes, not months
          </p>
        </div>

        {/* Process Flow */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`group relative transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Connection line (except for last item on large screens) */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent lg:block" />
              )}

              <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6 backdrop-blur-xl transition-all hover:border-blue-500/50 hover:bg-slate-900/50">
                {/* Glow effect */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />

                {/* Content */}
                <div className="relative">
                  {/* Step number */}
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-500/10 p-3">
                    <step.icon className="h-6 w-6 text-blue-400" />
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>

                  <p className="mb-2 text-slate-300">{step.description}</p>
                  <p className="text-sm text-slate-500">{step.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Specs Bar */}
        <div className={`mt-12 rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6 backdrop-blur-xl transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          style={{ transitionDelay: '600ms' }}
        >
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Network</div>
              <div className="mt-2 text-2xl font-bold text-white">Base Mainnet</div>
            </div>
            <div>
              <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Token Supply</div>
              <div className="mt-2 text-2xl font-bold text-white">90T SYNTH</div>
            </div>
            <div>
              <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Evaluation Time</div>
              <div className="mt-2 text-2xl font-bold text-white">~10 min</div>
            </div>
            <div>
              <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Submission Fee</div>
              <div className="mt-2 text-2xl font-bold text-white">$500</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

