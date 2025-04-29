import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Initialize response
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Create a Supabase client with the request and response
    const supabase = createServerClient(
      process.env.SERVER_SUPABASE_URL!,
      process.env.SERVER_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // This is needed to set cookies for browser
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            // This is needed to remove cookies for browser
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh the session and verify user
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session

    if (session) {
      // Verify user with getUser()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('[Middleware] User verification failed:', userError?.message)
        // Clear session if user verification fails
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Debug: log the current path and session status
    console.log(`[Middleware] Path: ${request.nextUrl.pathname} | Session: ${session ? 'Authenticated' : 'Unauthenticated'}`)

    // CRITICAL PROTECTED ROUTES: Dashboard and all its sub-routes are protected
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        console.log('[Middleware] Redirecting from dashboard to login (not authenticated)')
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // AUTH ROUTES: Redirect authenticated users away from auth pages
    if ((request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) && session) {
      console.log('[Middleware] Redirecting from auth page to dashboard (already authenticated)')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // HOME REDIRECT: Redirect authenticated users from home to dashboard
    if (request.nextUrl.pathname === '/' && session) {
      console.log('[Middleware] Redirecting from home to dashboard (authenticated)')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error)
    // If there's an error, we'll let the request proceed
    // but we won't do any redirects
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register', '/api/:path*'],
} 