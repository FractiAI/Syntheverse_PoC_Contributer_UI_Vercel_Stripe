import { redirect } from 'next/navigation';
import FractiAILanding from '@/components/FractiAILanding';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Syntheverse POST SINGULARITY^6: Vibeverse FSR Geyser Perpetual Engine Core',
  description:
    'Sovereign truth management for Frontier R&D, Frontier Creators & Frontier Enterprises. Public Cloud Shell with a nested HHF-AI MRI ATOMIC CORE. (IN TEST)',
};

export default async function LandingPage() {
  const { user, isOperator, isCreator } = await getAuthenticatedUserWithRole();

  // Redirect approved testers automatically if logged in
  if (user && (isOperator || isCreator)) {
    redirect('/operator/dashboard');
  }

  return (
    <FractiAILanding
      variant="fractiai"
      isAuthenticated={!!user}
      isApprovedTester={isOperator || isCreator}
      systemNotice={user && !isOperator && !isCreator ? "WE ARE IN TEST AND WILL BE BACK ONLINE SHORTLY" : undefined}
      cta={{
        primaryHref: '/login?redirect=/operator/dashboard',
        primaryLabel: 'TESTER LOGIN',
      }}
    />
  );
}
