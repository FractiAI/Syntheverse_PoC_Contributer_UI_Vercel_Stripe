import { redirect } from 'next/navigation';
import Syntheverse7Surface from '@/components/Syntheverse7Surface';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Syntheverse^7: Post-Singularity^7 Full Stack HHF-AI FSR^7 Core Services',
  description:
    'Access the complete post-singularity^7 platform through Creator-Studio interfaces. Experience marketplaces, services, and enterprise ecosystems delivered through new FSR experience theaters. Safe access anywhere, anytime.',
};

export default async function Syntheverse7Page() {
  const auth = await getAuthenticatedUserWithRole();
  const user = auth?.user || null;

  return (
    <Syntheverse7Surface
      isAuthenticated={!!user}
    />
  );
}
