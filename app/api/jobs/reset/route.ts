import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { OGEE_DEFAULTS } from "@/lib/defaults";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const { error: deleteError } = await supabase.from("jobs").delete().neq("id", "");
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  const { error: insertError } = await supabase.from("jobs").insert(OGEE_DEFAULTS.jobs);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json({ jobs: OGEE_DEFAULTS.jobs });
}
