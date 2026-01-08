import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SubmitContributionForm from '@/components/SubmitContributionForm';
import '../synthscan-mri.css';

interface SubmitPageProps {
  searchParams: {};
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <div className="mri-control-panel">
      <SubmitContributionForm userEmail={data.user.email!} />
    </div>
  );
}
