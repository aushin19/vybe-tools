import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type UnsafeUnwrappedCookies } from 'next/headers'

export const createClient = () => {
  // Use the async workaround from Next.js documentation
  // Directly awaiting cookies() here won't work, so we use the unsafe type assertion
  // This is a temporary workaround for Next.js 15
  const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, any>) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: Record<string, any>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
} 