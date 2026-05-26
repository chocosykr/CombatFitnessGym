import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  
  // @ts-ignore - Mocking getUser for development
  supabase.auth.getUser = async () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )mock_user_phone=([^;]+)'));
      const mockPhone = match ? match[2] : null;
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
    }
    return originalGetUser();
  };

  return supabase;
}
