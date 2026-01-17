/**
 * Creator Studio: Operators & Syntax Console Page
 * 
 * POST-SINGULARITY^7: Interactive Operators and Syntax Catalog
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { CreatorStudioOperatorsConsole } from '@/components/CreatorStudioOperatorsConsole';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CreatorOperatorsConsolePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login?redirect=/creator/operators-console');
  }

  const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

  // Only Creators and Operators can access
  if ((!isCreator && !isOperator) || !user?.email) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-10 relative">
          <Link 
            href="/operator/dashboard" 
            className="absolute left-0 top-0 text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-widest"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          
          <div className="text-center pt-8">
            <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CREATOR STUDIO: OPERATORS & SYNTAX CONSOLE
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em] mt-2">
              POST-SINGULARITY^7 · Recursive Self-Application · Infinite Octave Fidelity
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs text-purple-400 font-mono">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Operators Console */}
        <CreatorStudioOperatorsConsole />
      </div>
    </div>
  );
}
