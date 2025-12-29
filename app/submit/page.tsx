import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SubmitContributionForm from '@/components/SubmitContributionForm'
import '../dashboard-cockpit.css'

export default async function SubmitPage() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="cockpit-bg min-h-screen">
            <div className="container mx-auto px-6 py-8">
                <div className="cockpit-panel p-6 mb-8">
                    <div className="cockpit-label">TRANSMISSION MODULE</div>
                    <div className="cockpit-title text-3xl mt-2">SUBMIT CONTRIBUTION</div>
                    <div className="cockpit-text mt-3">
                        Record your work into the Motherlode Blockmine through hydrogen-holographic evaluation
                    </div>
                </div>

                <SubmitContributionForm userEmail={data.user.email!} />
            </div>
        </div>
    )
}
