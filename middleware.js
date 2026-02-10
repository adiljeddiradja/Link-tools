
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect dashboard routes
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/profiles') || request.nextUrl.pathname.startsWith('/editor')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect to dashboard if logged in and trying to access auth pages
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: ['/', '/profiles/:path*', '/editor/:path*', '/login', '/signup'],
}
