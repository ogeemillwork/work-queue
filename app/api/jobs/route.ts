import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const { data, error } = await supabase.from("jobs").select("*").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: data });
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const job: Job = await req.json();
  if (!job?.id || !job.name?.trim()) {
    return NextResponse.json({ error: "Job id and name are required" }, { status: 400 });
  }
  const { error } = await supabase.from("jobs").upsert({
    id: job.id,
    name: job.name,
    client: job.client ?? "",
    priority: job.priority ?? "Normal",
    status: job.status ?? "Queued",
    lead: job.lead ?? "",
    due: job.due ?? "",
    materials: job.materials ?? "Waiting",
    notes: job.notes ?? "",
    dropbox: job.dropbox ?? "",
    handoff: job.handoff ?? "",
    subtasks: job.subtasks ?? [],
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
