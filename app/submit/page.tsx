import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SubmitContributionForm from '@/components/SubmitContributionForm'

export default async function SubmitPage() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Submit Contribution</h1>
                <p className="text-muted-foreground mt-2">
                    Upload your work for hydrogen-holographic evaluation
                </p>
            </div>

            <SubmitContributionForm userEmail={data.user.email!} />
        </div>
    )
}
