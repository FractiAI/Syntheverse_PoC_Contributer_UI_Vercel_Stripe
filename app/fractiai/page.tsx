import FractiAIBulletin from '@/components/FractiAIBulletin';
import { createClient } from '@/utils/supabase/server';
import '../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function FractiAIPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return <FractiAIBulletin isAuthenticated={!!user} />;
}
