import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side only. When the env vars are missing the API routes return 503
// and the frontend falls back to localStorage.
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
