
import { createClient } from '@/lib/supabaseServer'
import BioTemplate from '@/app/components/BioTemplate'

// Force dynamic rendering since we are fetching data that might change
export const dynamic = 'force-dynamic'

export default async function BioPage({ params }) {
    const { username } = await params // 'username' here matches the folder [username], but we treat it as 'handle' now

    // 1. Fetch Profile by Handle
    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', username)
        .single()

    if (profileError || !profile) {
        // Fallback for old "user_id" based URLs (Backwards Compatibility)
        // If we can't find a profile with this handle, maybe it's a legacy user_id URL?
        // For this task, let's just show "Profile not found" to encourage using the new system.
        // Or we could try to find a profile where user_id = username?

        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-400">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
                    <p>The page @{username} does not exist.</p>
                </div>
            </div>
        )
    }

    // 2. Fetch Links for this Profile
    const { data: links, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })

    return (
        <BioTemplate profile={profile} links={links || []} />
    )
}
