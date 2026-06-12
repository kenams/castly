import { createBrowserClient } from '@supabase/ssr';

// Declared at module level so Next.js inlines NEXT_PUBLIC_ vars at compile time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === 'undefined') return null as never;
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}
