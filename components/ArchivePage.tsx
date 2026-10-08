"use client";

import Link from "next/link";
import { useState } from "react";
import { Job } from "@/lib/types";
import { STATE_COLORS } from "./JobCard";

// Jobs whose rooms have all finished (or that an admin archived), newest
// first. Each opens its job page; admins can put one back on the board.
export default function ArchivePage({
  jobs,
  canEdit,
  onRestore,
}: {
  jobs: Job[];
  canEdit: boolean;
  onRestore: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const shown = jobs
    .filter((j) => !q || `${j.name} ${j.client} ${j.notes}`.toLowerCase().includes(q))
    .sort((a, b) => (b.archivedAt ?? "").localeCompare(a.archivedAt ?? ""));

  return (
    <main className="flex flex-col px-[18px] pb-[18px] pt-[14px] min-[901px]:min-h-0 min-[901px]:flex-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href="/" className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 text-[14px] font-bold">
          ← Board
        </Link>
        <h2 className="text-[22px] font-bold">Archive</h2>
        <span className="text-[13px] text-muted">
          {jobs.length} job{jobs.length === 1 ? "" : "s"}
        </span>
        <span className="flex-1" />
        <input
          type="search"
          className="w-full rounded-[10px] border border-line bg-panel px-2.5 py-[9px] text-ink sm:w-[320px]"
          placeholder="Search archived jobs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="mt-3.5 overflow-hidden rounded-2xl border border-line bg-panel min-[901px]:min-h-0 min-[901px]:flex-1">
        <div className="h-full overflow-y-auto p-2.5">
          {shown.length === 0 && (
            <p className="p-3 text-[14px] text-muted">
              {jobs.length === 0
                ? "No archived jobs yet. A job moves here once every one of its rooms is Complete."
                : "No archived jobs match that search."}
            </p>
          )}
          {shown.map((j) => (
            <div
              key={j.id}
              className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[#2b3743] bg-card px-3.5 py-3"
            >
              <Link href={`/job/${encodeURIComponent(j.id)}`} className="min-w-0 flex-1">
                <div className="truncate font-bold hover:underline">{j.name}</div>
                <div className="mt-0.5 text-[13px] text-muted">
                  {j.client || "—"}
                  {j.archivedAt ? ` · archived ${new Date(j.archivedAt).toLocaleDateString()}` : ""}
                </div>
              </Link>
              <div className="flex flex-wrap gap-1">
                {j.rooms.map((r) => (
                  <span
                    key={r.id}
                    className="rounded-full border border-current px-[6px] py-[3px] text-[10px] font-extrabold"
                    style={{ color: STATE_COLORS[r.state] }}
                  >
                    {r.name} · {r.state}
                  </span>
                ))}
              </div>
              {canEdit && (
                <button
                  className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 text-[14px] font-bold"
                  onClick={() => onRestore(j.id)}
                >
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
