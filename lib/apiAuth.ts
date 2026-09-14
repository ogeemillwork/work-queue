import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseForToken, isDbConfigured } from "./supabase";

// Shared guard for the /api/jobs* routes: 503 when no database is configured
// (frontend falls back to localStorage), 401 when the caller has no session.
export function supabaseFromRequest(
  req: NextRequest
): { supabase: SupabaseClient; error?: never } | { supabase?: never; error: NextResponse } {
  if (!isDbConfigured()) {
    return { error: NextResponse.json({ error: "Database not configured" }, { status: 503 }) };
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  const supabase = getSupabaseForToken(token);
  if (!supabase) {
    return { error: NextResponse.json({ error: "Database not configured" }, { status: 503 }) };
  }
  return { supabase };
}
