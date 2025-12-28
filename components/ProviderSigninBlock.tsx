import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProviderSigninBlock() {
    // OAuth providers are enabled by default - they work if configured in Supabase
    // The actual client IDs and secrets are managed in Supabase dashboard
    const isGoogleEnabled = true // Always show Google option

    return (
        <div className="grid gap-2">
            {isGoogleEnabled && (
                <Link href="/auth/google">
                    <Button variant="outline" type="button" className="w-full">
                        <FaGoogle className="mr-2 h-4 w-4" />
                        Continue with Google
                    </Button>
                </Link>
            )}
        </div>
    )
}