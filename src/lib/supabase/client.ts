import { createBrowserClient } from '@supabase/ssr';

// Returns null during SSR (client components generate static shell only — useEffect handles auth)
export function createClient() {
  if (typeof window === 'undefined') return null as never;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
