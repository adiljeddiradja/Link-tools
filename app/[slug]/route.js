
import { supabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'

export async function GET(request, { params }) {
    const { slug } = await params
    console.log('Redirecting slug:', slug) // Debug log

    const { data, error } = await supabase
        .from('links')
        .select('original_url, is_active')
        .eq('slug', slug)
        .maybeSingle()

    if (data) {
        if (data.is_active === false) {
            return new Response(`
                <html>
                    <body style="font-family: sans-serif; display: flex; align-items: center; justify-center; height: 100vh; margin: 0; background: #0f172a; color: white; text-align: center;">
                        <div style="padding: 20px;">
                            <h1 style="color: #64748b;">⚠️ Link Tidak Aktif</h1>
                            <p>Maaf, link ini sedang dinonaktifkan sementara oleh pemiliknya.</p>
                            <p style="font-size: 0.8rem; margin-top: 2rem; color: #475569;">Credit by A Deel</p>
                        </div>
                    </body>
                </html>
            `, { headers: { 'Content-Type': 'text/html' } })
        }
        redirect(data.original_url)
    } else {
        return new Response('Link not found', { status: 404 })
    }
}
