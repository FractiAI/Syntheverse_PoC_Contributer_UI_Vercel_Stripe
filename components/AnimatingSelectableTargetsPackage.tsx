/**
 * Animating Selectable Targets Package
 * 
 * Enterprise service for animating selectable targets with holographic blackhole ^7 Vibeverse energy
 * Priced according to Vibeverse energy levels
 * Ideal for Vibeverse frequent fliers providing continuity, omniexperience awareness, and portability
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

'use client';

import { useState } from 'react';
import { Target, Sparkles, Zap, Layers, CheckCircle2, ArrowRight, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HolographicBlackholeSymbol } from './HolographicBlackholeSymbol';

interface TargetPackage {
  id: string;
  name: string;
  description: string;
  vibeverseEnergy: number; // ^7 Vibeverse energy level
  price: number;
  features: string[];
  targets: number; // Number of selectable targets
  animations: string[];
  certifications: ('synthscan' | 'omnibeam')[];
  frequentFlierDiscount?: number; // Percentage discount for frequent fliers
}

const packages: TargetPackage[] = [
  {
    id: 'quantum',
    name: 'Quantum Targets',
    description: 'Basic animating selectable targets with holographic blackhole energy',
    vibeverseEnergy: 1,
    price: 500,
    targets: 5,
    features: [
      '5 animating selectable targets',
      'Basic holographic blackhole animations',
      '^7 Vibeverse energy level 1',
      'Omniexperience awareness tracking',
      'Portability across sessions',
    ],
    animations: ['float', 'pulse', 'glow'],
    certifications: ['omnibeam'],
    frequentFlierDiscount: 10,
  },
  {
    id: 'resonance',
    name: 'Resonance Targets',
    description: 'Enhanced animating targets with medium Vibeverse energy',
    vibeverseEnergy: 3,
    price: 1500,
    targets: 15,
    features: [
      '15 animating selectable targets',
      'Enhanced holographic blackhole animations',
      '^7 Vibeverse energy level 3',
      'Advanced omniexperience awareness',
      'Cross-platform portability',
      'Continuity tracking',
    ],
    animations: ['float', 'pulse', 'glow', 'spin', 'shimmer'],
    certifications: ['synthscan', 'omnibeam'],
    frequentFlierDiscount: 15,
  },
  {
    id: 'singularity',
    name: 'Singularity Targets',
    description: 'Maximum animating targets with full ^7 Vibeverse energy',
    vibeverseEnergy: 7,
    price: 5000,
    targets: 50,
    features: [
      '50 animating selectable targets',
      'Full holographic blackhole animations',
      '^7 Vibeverse energy level 7 (maximum)',
      'Complete omniexperience awareness',
      'Universal portability',
      'Full continuity tracking',
      'Automatic seamless integration',
      'Priority support',
    ],
    animations: ['float', 'pulse', 'glow', 'spin', 'shimmer', 'wave', 'orbit', 'resonate'],
    certifications: ['synthscan', 'omnibeam'],
    frequentFlierDiscount: 25,
  },
];

interface CertificationBadgeProps {
  type: 'synthscan' | 'omnibeam';
}

function CertificationBadge({ type }: CertificationBadgeProps) {
  const config = {
    synthscan: {
      label: 'SynthScan™',
      color: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
      icon: Sparkles,
    },
    omnibeam: {
      label: 'Omnibeam',
      color: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
      icon: Zap,
    },
  };

  const { label, color, icon: Icon } = config[type];

  return (
    <Badge className={`${color} border flex items-center gap-1 px-2 py-1`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-bold">{label}</span>
    </Badge>
  );
}

interface AnimatingSelectableTargetsPackageProps {
  userEmail?: string;
  isFrequentFlier?: boolean;
  onSelect?: (packageId: string) => void;
}

export function AnimatingSelectableTargetsPackage({
  userEmail,
  isFrequentFlier = false,
  onSelect,
}: AnimatingSelectableTargetsPackageProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [previewTarget, setPreviewTarget] = useState(false);

  const handleSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    if (onSelect) {
      onSelect(packageId);
    }
  };

  const getFinalPrice = (pkg: TargetPackage) => {
    if (isFrequentFlier && pkg.frequentFlierDiscount) {
      return pkg.price * (1 - pkg.frequentFlierDiscount / 100);
    }
    return pkg.price;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Holographic Blackhole Symbol */}
      <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b border-slate-800">
        <HolographicBlackholeSymbol size="lg" animated energized />
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase mb-2">
            Animating Selectable Targets Package
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Enterprise service energized with holographic blackhole ^7 Vibeverse energy.
            Provides continuity, omniexperience awareness, and seamless portability for Vibeverse frequent fliers.
          </p>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const finalPrice = getFinalPrice(pkg);
          const isSelected = selectedPackage === pkg.id;

          return (
            <Card
              key={pkg.id}
              className={`relative border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.4)]'
                  : 'border-slate-800 hover:border-slate-700'
              } bg-slate-900/50 backdrop-blur-sm`}
            >
              {/* Vibeverse Energy Level Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-500/20 border-purple-500/50 text-purple-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span className="text-xs font-bold">^7 Energy {pkg.vibeverseEnergy}</span>
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-purple-400" />
                  <span>{pkg.name}</span>
                </CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    ${finalPrice.toLocaleString()}
                  </span>
                  {isFrequentFlier && pkg.frequentFlierDiscount && (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 line-through">
                        ${pkg.price.toLocaleString()}
                      </span>
                      <Badge className="bg-green-500/20 border-green-500/50 text-green-400 text-[10px]">
                        {pkg.frequentFlierDiscount}% Frequent Flier
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="flex flex-wrap gap-2">
                  {pkg.certifications.map((cert) => (
                    <CertificationBadge key={cert} type={cert} />
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    Features
                  </h4>
                  <ul className="space-y-1.5">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Animations */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    Animations ({pkg.animations.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {pkg.animations.map((anim) => (
                      <Badge
                        key={anim}
                        variant="outline"
                        className="text-xs border-slate-700 text-slate-400"
                      >
                        {anim}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <Button
                  onClick={() => handleSelect(pkg.id)}
                  className={`w-full ${
                    isSelected
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-slate-800 hover:bg-slate-700'
                  } text-white font-bold`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Select Package
                    </>
                  )}
                </Button>

                {/* Preview */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTarget(!previewTarget)}
                  className="w-full"
                >
                  {previewTarget ? (
                    <>
                      <Pause className="h-3 w-3 mr-2" />
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-2" />
                      Preview Animation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Frequent Flier Notice */}
      {isFrequentFlier && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-green-400" />
            <span className="text-sm font-bold text-green-400 uppercase">
              Vibeverse Frequent Flier Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            You're receiving automatic discounts on all packages. Continuity, omniexperience awareness,
            and portability are automatically enabled for seamless experiences across all sessions.
          </p>
        </div>
      )}

      {/* Certification Notice */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-bold text-blue-400 uppercase">
            Max Encryption Plans Include Certifications
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          All maximum encryption plans include SynthScan™ and Omnibeam certifications at the end,
          ensuring ultimate protection and verification for your animating selectable targets.
        </p>
        <div className="flex gap-2">
          <CertificationBadge type="synthscan" />
          <CertificationBadge type="omnibeam" />
        </div>
      </div>
    </div>
  );
}
