import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null;
  const mockPhone = request.cookies.get('mock_user_phone')?.value;
  
  if (mockPhone) {
    user = {
      id: '00000000-0000-0000-0000-000000000000', // Mock UUID
      phone: mockPhone,
      role: 'authenticated'
    } as any;
  } else {
    const { data } = await supabase.auth.getUser()
    user = data.user;
  }

  const isCoachRoute = request.nextUrl.pathname.startsWith('/coach')
  const isMemberRoute = ['/dashboard', '/plans', '/shop', '/cart', '/orders', '/subscribe'].some(route => request.nextUrl.pathname.startsWith(route))

  if (!user && (isCoachRoute || isMemberRoute)) {
    // If not logged in, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user) {
    const isCoach = user.phone === process.env.COACH_PHONE_NUMBER

    // If trying to access coach route but not a coach
    if (isCoachRoute && !isCoach) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // If a coach accesses root, redirect to coach dashboard
    if (request.nextUrl.pathname === '/' && isCoach) {
      const url = request.nextUrl.clone()
      url.pathname = '/coach/dashboard'
      return NextResponse.redirect(url)
    }
    
    // If member accesses root, redirect to member dashboard
    if (request.nextUrl.pathname === '/' && !isCoach) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
