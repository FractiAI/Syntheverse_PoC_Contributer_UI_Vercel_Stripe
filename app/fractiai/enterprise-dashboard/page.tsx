import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EnterpriseDashboardPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  
  // Require authentication - redirect to login if not authenticated
  if (error || !data?.user) {
    redirect('/login');
  }

  // Redirect to creator dashboard (enterprise mode)
  redirect('/creator/dashboard');
}
