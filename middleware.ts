import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser() not getSession() — validates the token server-side
  // on every request and cannot be spoofed via a forged cookie
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // Detect if request is coming from the admin subdomain.
  // Matches admin.anydomain.com and admin.*.vercel.app.
  // Does NOT match localhost (local dev uses /admin path directly).
  const isAdminSubdomain = host.startsWith('admin.') && !host.startsWith('localhost')

  const isAdminPath = pathname.startsWith('/admin')

  // Works for both /admin/login (main domain) and /login (admin subdomain
  // after the rewrite maps admin.yourdomain.com/login → /login internally)
  const isLoginPath =
    pathname === '/admin/login' ||
    pathname === '/login' ||
    pathname === '/admin/login/'

  // Build the correct login URL based on which domain the request is from
  const loginUrl = isAdminSubdomain
    ? `https://${host}/login`
    : new URL('/admin/login', request.url).toString()

  // Build the correct admin URL based on which domain the request is from
  const adminUrl = isAdminSubdomain
    ? `https://${host}`
    : new URL('/admin', request.url).toString()

  // No user on an admin route or admin subdomain → redirect to login
  if (!user && (isAdminPath || isAdminSubdomain) && !isLoginPath) {
    return NextResponse.redirect(loginUrl)
  }

  // User already logged in on login page → redirect to admin dashboard
  if (user && isLoginPath) {
    return NextResponse.redirect(adminUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
