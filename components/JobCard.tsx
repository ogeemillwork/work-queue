"use client";

import { Job, Priority } from "@/lib/types";

const PRIORITY_BORDER: Record<Priority, string> = {
  Urgent: "border-l-[#c93535]",
  High: "border-l-[#e17826]",
  Normal: "border-l-[#4d78b8]",
  Low: "border-l-[#8b9299]",
};

const MATERIALS_BG: Record<string, string> = {
  Ready: "bg-[#def0df]",
  Partial: "bg-[#f4edc9]",
  Waiting: "bg-[#f9e4d0]",
};

export default function JobCard({
  job,
  shopTv,
  onOpen,
  onMove,
}: {
  job: Job;
  shopTv: boolean;
  onOpen: () => void;
  onMove: (delta: number) => void;
}) {
  const done = job.subtasks.filter((s) => s.done).length;
  const total = job.subtasks.length;

  return (
    <article
      className={`mb-2.5 rounded-[10px] border-l-[5px] bg-white shadow-card ${PRIORITY_BORDER[job.priority]} ${shopTv ? "p-4" : "p-[11px]"}`}
      onDoubleClick={onOpen}
    >
      <div className="flex justify-between gap-2">
        <div>
          <div className="[font-weight:750]">{job.name}</div>
          <div className="mt-0.5 text-[13px] text-muted">{job.client}</div>
        </div>
        <span className="h-fit rounded-full bg-[#efefec] px-[7px] py-[3px] text-[11px]">{job.priority}</span>
      </div>
      <div className="mb-[7px] mt-[9px] flex flex-wrap gap-[5px]">
        <span className={`rounded-full px-[7px] py-[3px] text-[11px] ${MATERIALS_BG[job.materials] ?? "bg-[#efefec]"}`}>
          Materials: {job.materials}
        </span>
        {total > 0 && (
          <span className="rounded-full bg-[#efefec] px-[7px] py-[3px] text-[11px]">
            {done}/{total} subtasks
          </span>
        )}
      </div>
      <div className="grid gap-1 text-xs text-muted">
        <span>Lead: {job.lead || "—"}</span>
        <span>Due: {job.due || "—"}</span>
      </div>
      {!shopTv && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button className="rounded-lg border border-line bg-white px-2 py-[5px] text-xs" onClick={onOpen}>
            Details
          </button>
          <button className="rounded-lg border border-line bg-white px-2 py-[5px] text-xs" onClick={() => onMove(-1)}>
            ←
          </button>
          <button className="rounded-lg border border-line bg-white px-2 py-[5px] text-xs" onClick={() => onMove(1)}>
            →
          </button>
        </div>
      )}
    </article>
  );
}
