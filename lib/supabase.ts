import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side only. When the env vars are missing the API routes return 503
// and the frontend falls back to localStorage.
function env(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function isDbConfigured(): boolean {
  return env() !== null;
}

// Client acting as the calling user: RLS on jobs/profiles is the enforcement
// point, so routes just pass the caller's access token through.
export function getSupabaseForToken(token: string): SupabaseClient | null {
  const e = env();
  if (!e) return null;
  return createClient(e.url, e.key, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
