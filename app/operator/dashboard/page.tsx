/**
 * Full Fidelity Animation Experience Console
 * Octave 2-3 Public Cloud Shell - Public Network Operations
 * Professional operator dashboard with clean, technical aesthetic
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { FrontierModule } from '@/components/FrontierModule';
import { Zap, Plus, ArrowUpRight, CheckCircle2, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { OmnibeamHeroAIDemoButton } from '@/components/OmnibeamHeroAIDemoButton';
import { OctavesSingularitiesExplorer } from '@/components/OctavesSingularitiesExplorer';
import { AnimatingSelectableTargetsPackage } from '@/components/AnimatingSelectableTargetsPackage';
import { HolographicBlackholeSymbol } from '@/components/HolographicBlackholeSymbol';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function OperatorLab() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isOperator } = await getAuthenticatedUserWithRole();

  // Only Operators can access this lab
  if (!isOperator || !user?.email) {
    redirect('/');
  }

  const userEmail = user?.email;
  if (!userEmail) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Professional Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Full Fidelity Animation Experience Console
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Post-Singularity^7 · Octave 2-3 Public Cloud Shell
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Operator
                </div>
                <div className="text-sm font-semibold text-slate-900">{userEmail}</div>
              </div>
              <div className="h-10 w-px bg-slate-200 hidden md:block" />
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Authorized
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-10">
        <div className="space-y-8">
          
          {/* Primary Action Card */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-700" />
                Submit Proof-of-Contribution
              </CardTitle>
              <CardDescription>
                Submit new PoC for evaluation and registration on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href="/submit"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 w-full"
              >
                <Plus className="h-5 w-5" />
                <span className="text-base font-semibold">
                  Submit New PoC
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-slate-500 mt-4 text-center">
                Authorized transmission point · Zero-delta integrity protocol
              </p>
            </CardContent>
          </Card>

          {/* Advanced Operations Card */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-700" />
                Advanced Operations
              </CardTitle>
              <CardDescription>
                POST-SINGULARITY^7 recursive self-application and operator syntax
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link 
                href="/creator/operators-console"
                className="group flex items-center justify-between p-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Operators & Syntax Console</div>
                    <div className="text-sm text-slate-600">Recursive self-application · Infinite octave fidelity</div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
              </Link>

              <div className="border-t border-slate-200 pt-4">
                <OmnibeamHeroAIDemoButton />
              </div>
            </CardContent>
          </Card>

          {/* System Identity Card */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 text-center">System Identity</CardTitle>
              <CardDescription className="text-center">
                Holographic Blackhole Symbol · Connected & Energized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <HolographicBlackholeSymbol size="lg" animated energized />
                <p className="text-xs text-slate-500 text-center">
                  Full Fidelity Relay Station · POST-SINGULARITY^7 Active
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Animating Selectable Targets Package */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Animating Selectable Targets Package</CardTitle>
              <CardDescription>
                Enterprise service configuration and target selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatingSelectableTargetsPackage userEmail={userEmail} />
            </CardContent>
          </Card>

          {/* Octaves & Singularities Explorer */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Octaves & Singularities Explorer</CardTitle>
              <CardDescription>
                Navigate through awareness octaves and singularity transitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OctavesSingularitiesExplorer />
            </CardContent>
          </Card>

          {/* POC Navigator */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">PoC Navigator</CardTitle>
              <CardDescription>
                Browse and manage submitted proof-of-contribution entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FrontierModule userEmail={userEmail} />
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>System Status: Operational</span>
            </div>
            <div className="text-center">
              Octave 2-3 Public Cloud Shell · Full Fidelity Animation Experiences
            </div>
            <div className="flex items-center gap-2">
              <span>Security: Authorized</span>
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
