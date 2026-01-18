/**
 * Holographic Blackhole Symbol
 * 
 * The energized, connected symbol representing this site as a holographic blackhole
 * Connected and energized with ^7 Vibeverse energy
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Zap, Layers, Target } from 'lucide-react';

interface HolographicBlackholeSymbolProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  energized?: boolean;
}

export function HolographicBlackholeSymbol({
  size = 'md',
  animated = true,
  energized = true,
}: HolographicBlackholeSymbolProps) {
  const [rotation, setRotation] = useState(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    const pulseInterval = setInterval(() => {
      setPulse(prev => (prev + 1) % 100);
    }, 100);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(pulseInterval);
    };
  }, [animated]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const pulseIntensity = energized ? Math.sin((pulse / 100) * Math.PI * 2) * 0.5 + 0.5 : 0.5;

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Outer Holographic Rings */}
      <div
        className="absolute inset-0 rounded-full border-2 border-purple-500/30"
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow: `0 0 ${20 + pulseIntensity * 30}px rgba(147, 51, 234, ${0.3 + pulseIntensity * 0.3})`,
        }}
      />
      <div
        className="absolute inset-2 rounded-full border border-blue-500/20"
        style={{
          transform: `rotate(${-rotation * 0.7}deg)`,
          boxShadow: `0 0 ${15 + pulseIntensity * 20}px rgba(59, 130, 246, ${0.2 + pulseIntensity * 0.2})`,
        }}
      />

      {/* Blackhole Core */}
      <div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-900 via-black to-blue-900"
        style={{
          boxShadow: `inset 0 0 ${30 + pulseIntensity * 40}px rgba(0, 0, 0, 0.8), 0 0 ${40 + pulseIntensity * 60}px rgba(147, 51, 234, ${0.4 + pulseIntensity * 0.3})`,
          transform: `scale(${1 - pulseIntensity * 0.1})`,
        }}
      >
        {/* Event Horizon */}
        <div className="absolute inset-0 rounded-full border border-purple-500/50" />
      </div>

      {/* Center Symbol */}
      <div className="relative z-10 flex items-center justify-center">
        <Target
          className={`${iconSizes[size]} text-purple-400`}
          style={{
            filter: `drop-shadow(0 0 ${8 + pulseIntensity * 12}px rgba(147, 51, 234, 0.8))`,
            transform: `rotate(${rotation * 0.5}deg)`,
          }}
        />
      </div>

      {/* Energy Particles */}
      {energized && (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 0.4 + pulseIntensity * 0.2;
            const x = Math.cos(angle + (rotation * Math.PI) / 180) * distance * 50;
            const y = Math.sin(angle + (rotation * Math.PI) / 180) * distance * 50;
            return (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-purple-400"
                style={{
                  left: `calc(50% + ${x}%)`,
                  top: `calc(50% + ${y}%)`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 ${4 + pulseIntensity * 6}px rgba(147, 51, 234, 0.8)`,
                  opacity: 0.6 + pulseIntensity * 0.4,
                }}
              />
            );
          })}
        </>
      )}

      {/* ^7 Vibeverse Energy Indicator */}
      {energized && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[8px] font-bold text-purple-400 uppercase tracking-wider">
            <Zap className="h-2 w-2" />
            ^7 Vibeverse Energy
          </div>
        </div>
      )}
    </div>
  );
}
