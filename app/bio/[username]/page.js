import { createClient } from '@/lib/supabaseServer'
import BioTemplate from '@/app/components/BioTemplate'
import { Layout } from 'lucide-react'

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
        .maybeSingle()

    if (profileError || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-400">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
                    <p>The page @{username} does not exist.</p>
                </div>
            </div>
        )
    }

    if (profile.is_active === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-400">
                <div className="text-center px-6">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                        <Layout size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Halaman Nonaktif</h1>
                    <p className="max-w-md mx-auto">Maaf, halaman ini sedang dinonaktifkan sementara oleh pemiliknya. Silakan cek kembali nanti.</p>
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <p className="text-sm italic">Credit by A Deel</p>
                    </div>
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
