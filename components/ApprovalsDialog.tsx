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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-[560px] rounded-[18px] border border-line bg-[#151c24] p-[18px] shadow-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Approvals</h2>
            <div className="text-[13px] text-muted">Approve sign-ups to give them access to the board</div>
          </div>
          <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <p className="mt-3 text-[13px] text-[#ff9d9d]">{error}</p>}

        <div className="mt-4">
          {profiles === null && <p className="text-[13px] text-muted">Loading…</p>}
          {profiles?.length === 0 && <p className="text-[13px] text-muted">No accounts yet.</p>}
          {profiles?.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 border-b border-line py-[9px]">
              <div className="min-w-0">
                <div className="truncate text-[14px] [font-weight:650]">{p.email || p.id}</div>
                <div className="text-xs text-muted">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {p.is_admin && <span className="rounded-full border border-[#427193] px-[7px] py-[3px] text-[11px] font-bold text-[#8ec8ef]">Admin</span>}
                <span className={`rounded-full border px-[7px] py-[3px] text-[11px] font-bold ${p.approved ? "border-[#408254] text-[#8ee4a6]" : "border-[#8d6c31] text-[#ebc66f]"}`}>
                  {p.approved ? "Approved" : "Pending"}
                </span>
                {p.id !== selfId &&
                  (p.approved ? (
                    <button
                      className="rounded-[10px] border border-[#6d3232] bg-[#3b1d1d] px-2 py-[5px] text-xs font-bold text-[#ffb8b8]"
                      onClick={() => setApproved(p, false)}
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      className="rounded-[10px] border border-warn bg-accent px-2 py-[5px] text-xs font-bold text-[#17130c]"
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
