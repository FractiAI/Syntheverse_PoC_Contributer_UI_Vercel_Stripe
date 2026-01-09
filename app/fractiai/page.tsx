import FractiAIBulletin from '@/components/FractiAIBulletin';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import '../dashboard-cockpit.css';
import '../synthscan-mri.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FractiAI Command Center | Syntheverse',
  description: 'Holographic Hydrogen Fractal Frontier Command Center - Mission Control for Proof-of-Contribution Protocol',
};

export default async function FractiAIPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // Get user role for header navigation
  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

  return (
    <div className="mri-control-panel">
      {/* Quick Actions Panel - Top Bar with Account Icon */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Content */}
      <div className="flex-1">
        <FractiAIBulletin isAuthenticated={!!user} />
      </div>
    </div>
  );
}
