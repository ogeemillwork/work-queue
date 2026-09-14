import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Browser-side client. null when the NEXT_PUBLIC_ env vars are absent —
// the app then runs in the original local-only mode with no auth.
export function getSupabaseBrowser(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}
