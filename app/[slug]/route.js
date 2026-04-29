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
        // If the link is explicitly deactivated, show the inactive page
        if (data.is_active === false) {
            return new Response(`
                <html>
                    <head>
                        <title>Link Tidak Aktif</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white; text-align: center;">
                        <div style="padding: 20px; width: 100%; max-width: 400px;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                            <h1 style="color: #94a3b8; margin-bottom: 0.5rem;">Link Tidak Aktif</h1>
                            <p style="color: #64748b;">Maaf, link ini sedang dinonaktifkan sementara oleh pemiliknya.</p>
                            <p style="font-size: 0.8rem; margin-top: 3rem; color: #334155; letter-spacing: 0.1em; font-weight: bold;">CREDIT BY A DEEL</p>
                        </div>
                    </body>
                </html>
            `, { headers: { 'Content-Type': 'text/html' } })
        }

        // Validate URL before redirecting
        if (!data.original_url) {
            return new Response('Destination URL missing', { status: 400 })
        }

        // Record the click
        await supabase.from('clicks').insert({
            link_id: data.id,
            profile_id: data.profile_id,
            user_agent: userAgent,
            referrer: referrer,
            country: country,
            device_type: deviceType
        })

        return redirect(data.original_url)
    } else {
        return new Response('Link not found', { status: 404 })
    }
}
