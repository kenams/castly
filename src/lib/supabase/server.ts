import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = 'https://gfmuhkejahvldzqxfpln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbXVoa2VqYWh2bGR6cXhmcGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTc3MzEsImV4cCI6MjA5MTEzMzczMX0.cXBUz_fh_FhcHsdPCT0V6MVkPE0nlozHCY3ZqSBb1NE';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
}

export function createServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbXVoa2VqYWh2bGR6cXhmcGxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAyMDcyOCwiZXhwIjoyMDU5NTk2NzI4fQ.6xvbKv8KRD_SFt1OQjbPsOTJ_aA3wqkTFUGNJY-rPHs';
  return createClient(SUPABASE_URL, serviceKey);
}
