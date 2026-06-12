import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = 'https://gfmuhkejahvldzqxfpln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbXVoa2VqYWh2bGR6cXhmcGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTc3MzEsImV4cCI6MjA5MTEzMzczMX0.cXBUz_fh_FhcHsdPCT0V6MVkPE0nlozHCY3ZqSBb1NE';

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === 'undefined') return null as never;
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}
