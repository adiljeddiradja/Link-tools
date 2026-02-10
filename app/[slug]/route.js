
import { supabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'

export async function GET(request, { params }) {
    const { slug } = await params
    console.log('Redirecting slug:', slug) // Debug log

    const { data, error } = await supabase
        .from('links')
        .select('original_url')
        .eq('slug', slug)
        .single()

    if (data && data.original_url) {
        redirect(data.original_url)
    } else {
        return new Response('Link not found', { status: 404 })
    }
}
