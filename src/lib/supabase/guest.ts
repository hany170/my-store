import { createClient } from '@supabase/supabase-js'

/**
 * Guest client for cart operations that don't require authentication
 */
export function createGuestClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
