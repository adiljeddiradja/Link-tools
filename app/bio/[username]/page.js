import { createClient } from '@/lib/supabaseServer'
import BioTemplate from '@/app/components/BioTemplate'
import { Layout } from 'lucide-react'

// Force dynamic rendering since we are fetching data that might change
export const dynamic = 'force-dynamic'

// Dynamic Metadata for SEO
export async function generateMetadata({ params }) {
    const { username } = await params
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, bio, handle, avatar_url')
        .eq('handle', username)
        .maybeSingle()

    if (!profile) return { title: 'Profile Not Found' }

    const title = `${profile.display_name || profile.handle} (@${profile.handle}) | Linkiez`
    const description = profile.bio || `Check out ${profile.display_name || profile.handle}'s links on Linkiez.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: profile.avatar_url ? [profile.avatar_url] : [],
            url: `https://linkiez.vercel.app/bio/${profile.handle}`,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: profile.avatar_url ? [profile.avatar_url] : [],
        }
    }
}

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

    // 2. Fetch Links for this Profile (only active ones)
    const { data: links, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profile.id)
        .or('is_active.eq.true,is_active.is.null') // Include true or null (default is true)
        .order('created_at', { ascending: false })

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        'mainEntity': {
            '@type': 'Person',
            'name': profile.display_name,
            'description': profile.bio,
            'image': profile.avatar_url,
            'identifier': profile.handle,
            'url': `https://linkiez.vercel.app/bio/${profile.handle}`
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BioTemplate profile={profile} links={links || []} />
        </>
    )
}
