/**
 * Alan Turing Command Center™
 * "We can only see a short distance ahead, but we can see plenty there that needs to be done"
 * Computational Intelligence & Cryptographic Analysis Applied to AI Systems
 * Accessible to all users (public + authenticated)
 */

import FractiAIBulletin from '@/components/FractiAIBulletin';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { HeroPanel } from '@/components/HeroPanel';
import { HeroAIManager } from '@/components/HeroAIManager';
import Image from 'next/image';
import { Cpu, Binary, Lock } from 'lucide-react';
import '../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function FractiAIPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // Get user role for header navigation
  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

  return (
    <div className="min-h-screen flex flex-col relative" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #001a0a 50%, #0a0a0a 100%)',
    }}>
      {/* Binary Matrix Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%),
            linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%)
          `,
          backgroundSize: '20px 20px',
          width: '100%',
          height: '100%',
        }}></div>
      </div>
      
      {/* Alan Turing Command Center Header */}
      <div className="relative z-10 flex-shrink-0" style={{
        background: 'linear-gradient(to right, rgba(0, 255, 65, 0.12), rgba(65, 105, 225, 0.08))',
        borderBottom: '3px solid #00FF41',
        boxShadow: '0 4px 20px rgba(0, 255, 65, 0.3)',
      }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Turing Machine Icon */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image 
                  src="/turing-machine.svg" 
                  alt="Turing Machine" 
                  width={64} 
                  height={64}
                  className="animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{
                  color: '#00FF41',
                  textShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
                  fontFamily: 'Courier New, monospace',
                }}>
                  Alan Turing Command Center™
                </h1>
                <p className="text-sm md:text-base mt-1" style={{color: 'rgba(0, 255, 65, 0.8)'}}>
                  Computational Intelligence · Cryptographic Analysis · Universal Computation
                </p>
                <p className="text-xs mt-1 italic" style={{color: 'rgba(65, 105, 225, 0.7)', fontFamily: 'Courier New, monospace'}}>
                  "We can only see a short distance ahead, but we can see plenty there that needs to be done."
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(0, 255, 65, 0.7)', fontFamily: 'Courier New, monospace'}}>
                  Computation Time
                </div>
                <div className="text-lg font-mono font-bold" style={{color: '#00FF41'}}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#00FF41] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #00FF41',
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Turing's Welcome Message */}
      <div className="relative z-10 container mx-auto px-6 py-4">
        <div className="cockpit-panel p-4" style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.08) 0%, rgba(65, 105, 225, 0.05) 100%)',
          borderLeft: '4px solid #00FF41',
        }}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔐</div>
            <div className="flex-1">
              <h3 className="text-sm font-bold mb-1" style={{color: '#00FF41', fontFamily: 'Courier New, monospace'}}>
                The Imitation Game: Computational Intelligence
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                This command center embodies Turing's principles: <strong>universal computation</strong>, 
                <strong> artificial intelligence</strong>, and <strong>code-breaking</strong>. 
                Can machines think? Let us compute.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel - Top Bar with Account Icon */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <FractiAIBulletin 
          isAuthenticated={!!user}
          isCreator={isCreator}
          isOperator={isOperator}
        />
        
        {/* Alan Turing AI Guide */}
        <div className="fixed bottom-4 left-4 z-50">
          <HeroAIManager
            pageContext="fractiai"
            additionalContext="FractiAI Command Center - AI evaluation and computational intelligence"
          />
        </div>
      </div>

      {/* Turing's Closing Wisdom */}
      <div className="relative z-10 container mx-auto px-6 py-4">
        <div className="cockpit-panel p-4 text-center" style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.08) 0%, rgba(65, 105, 225, 0.05) 100%)',
          borderTop: '2px solid #00FF41',
        }}>
          <div className="text-2xl mb-2">💻</div>
          <p className="text-xs text-[var(--text-secondary)] italic mb-1" style={{fontFamily: 'Courier New, monospace'}}>
            "Sometimes it is the people no one can imagine anything of who do the things no one can imagine."
          </p>
          <p className="text-xs" style={{color: '#00FF41'}}>
            — Alan Turing, Computing Machinery and Intelligence (1950)
          </p>
        </div>
      </div>
      
      {/* Hero Panel - The Outcast Hero (Fire & Bison) - Mission Control */}
      <HeroPanel 
        pageContext="fractiai" 
        pillarContext="contributor" 
        userEmail={user?.email || ''} 
      />
    </div>
  );
}
