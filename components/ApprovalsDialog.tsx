"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { Profile } from "@/lib/types";

export default function ApprovalsDialog({ selfId, onClose }: { selfId: string; onClose: () => void }) {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("approved", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setProfiles(data as Profile[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproved(p: Profile, approved: boolean) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError("");
    const { error } = await supabase.from("profiles").update({ approved }).eq("id", p.id);
    if (error) setError(error.message);
    await load();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-[560px] rounded-[14px] bg-white p-[18px] shadow-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Approvals</h2>
            <div className="text-[13px] text-muted">Approve sign-ups to give them access to the board</div>
          </div>
          <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}

        <div className="mt-4">
          {profiles === null && <p className="text-[13px] text-muted">Loading…</p>}
          {profiles?.length === 0 && <p className="text-[13px] text-muted">No accounts yet.</p>}
          {profiles?.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 border-b border-[#eee] py-[9px]">
              <div className="min-w-0">
                <div className="truncate text-[14px] [font-weight:650]">{p.email || p.id}</div>
                <div className="text-xs text-muted">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {p.is_admin && <span className="rounded-full bg-[#dde8f6] px-[7px] py-[3px] text-[11px]">Admin</span>}
                <span className={`rounded-full px-[7px] py-[3px] text-[11px] ${p.approved ? "bg-[#def0df]" : "bg-[#f9e4d0]"}`}>
                  {p.approved ? "Approved" : "Pending"}
                </span>
                {p.id !== selfId &&
                  (p.approved ? (
                    <button
                      className="rounded-lg border border-line bg-transparent px-2 py-[5px] text-xs text-danger"
                      onClick={() => setApproved(p, false)}
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      className="rounded-lg border border-accent bg-accent px-2 py-[5px] text-xs text-white"
                      onClick={() => setApproved(p, true)}
                    >
                      Approve
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
