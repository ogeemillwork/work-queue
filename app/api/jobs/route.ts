import { NextRequest, NextResponse } from "next/server";
import { supabaseFromRequest } from "@/lib/apiAuth";
import { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { supabase, error: guard } = supabaseFromRequest(req);
  if (guard) return guard;
  const { data, error } = await supabase.from("jobs").select("*").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const jobs = (data ?? []).map((row: Record<string, unknown>) => {
    const { client_phone, client_email, ...rest } = row;
    return { ...rest, clientPhone: client_phone ?? "", clientEmail: client_email ?? "" };
  });
  return NextResponse.json({ jobs });
}

export async function PUT(req: NextRequest) {
  const { supabase, error: guard } = supabaseFromRequest(req);
  if (guard) return guard;
  const job: Job = await req.json();
  if (!job?.id || !job.name?.trim()) {
    return NextResponse.json({ error: "Job id and name are required" }, { status: 400 });
  }
  const row = {
    id: job.id,
    name: job.name,
    client: job.client ?? "",
    priority: job.priority ?? "Medium",
    status: job.status ?? "Queued",
    lead: job.lead ?? "",
    due: job.due ?? "",
    materials: job.materials ?? "Waiting",
    notes: job.notes ?? "",
    dropbox: job.dropbox ?? "",
    handoff: job.handoff ?? "",
    subtasks: job.subtasks ?? [],
    updated_at: new Date().toISOString(),
  };
  let { error } = await supabase
    .from("jobs")
    .upsert({ ...row, client_phone: job.clientPhone ?? "", client_email: job.clientEmail ?? "" });
  if (error && /client_phone|client_email/.test(error.message)) {
    // contact columns not migrated yet — save the rest of the job
    ({ error } = await supabase.from("jobs").upsert(row));
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { supabase, error: guard } = supabaseFromRequest(req);
  if (guard) return guard;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
