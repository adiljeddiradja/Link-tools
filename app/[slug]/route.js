import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
    const { slug } = await params
    const headerList = await headers()
    const userAgent = headerList.get('user-agent') || 'unknown'
    const referrer = headerList.get('referer') || 'direct'

    // Attempt to get country from Vercel headers if available
    const country = headerList.get('x-vercel-ip-country') || 'unknown'

    // Simple device detection
    const isMobile = /mobile/i.test(userAgent)
    const deviceType = isMobile ? 'mobile' : 'desktop'

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('links')
        .select('id, profile_id, original_url, is_active')
        .eq('slug', slug)
        .maybeSingle()

    if (data) {
        if (data.is_active === false) {
            return new Response(`
                <html>
                    <body style="font-family: sans-serif; display: flex; align-items: center; justify-center; height: 100vh; margin: 0; background: #0f172a; color: white; text-align: center;">
                        <div style="padding: 20px; width: 100%;">
                            <h1 style="color: #64748b;">⚠️ Link Tidak Aktif</h1>
                            <p>Maaf, link ini sedang dinonaktifkan sementara oleh pemiliknya.</p>
                            <p style="font-size: 0.8rem; margin-top: 2rem; color: #475569;">Credit by A Deel</p>
                        </div>
                    </body>
                </html>
            `, { headers: { 'Content-Type': 'text/html' } })
        }

        // Record the click (fire and forget for better performance, though Supabase is fast)
        // We use the service role or a public insert policy
        await supabase.from('clicks').insert({
            link_id: data.id,
            profile_id: data.profile_id,
            user_agent: userAgent,
            referrer: referrer,
            country: country,
            device_type: deviceType
        })

        redirect(data.original_url)
    } else {
        return new Response('Link not found', { status: 404 })
    }
}
