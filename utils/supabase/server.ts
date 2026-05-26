import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  
  // @ts-ignore - Mocking getUser for development
  supabase.auth.getUser = async () => {
    const mockPhone = cookieStore.get('mock_user_phone')?.value;
    if (mockPhone) {
      return {
        data: {
          user: {
            id: '00000000-0000-0000-0000-000000000000', // Mock UUID
            phone: mockPhone,
            role: 'authenticated'
          } as any
        },
        error: null
      };
    }
    return originalGetUser();
  };

  return supabase;
}
