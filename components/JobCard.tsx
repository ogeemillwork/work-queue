"use client";

import { Job, Priority } from "@/lib/types";

const PRIORITY_BORDER: Record<Priority, string> = {
  Urgent: "border-l-[#a855f7]",
  High: "border-l-danger",
  Medium: "border-l-warn",
  Low: "border-l-ok",
};

const PRIORITY_TAG: Record<Priority, string> = {
  Urgent: "text-[#c084fc]",
  High: "text-[#ff8585]",
  Medium: "text-[#f0c86c]",
  Low: "text-[#77d895]",
};

const MATERIALS_PILL: Record<string, string> = {
  Ready: "border-[#408254] text-[#8ee4a6]",
  Partial: "border-[#8d6c31] text-[#ebc66f]",
  Waiting: "border-[#924949] text-[#ff9696]",
};

export default function JobCard({
  job,
  selectedEmployee = "",
  onOpen,
}: {
  job: Job;
  selectedEmployee?: string;
  onOpen: () => void;
}) {
  const done = job.subtasks.filter((s) => s.done).length;
  const total = job.subtasks.length;
  const employeeTasks = selectedEmployee ? job.subtasks.filter((s) => s.employee === selectedEmployee) : [];

  return (
    <article
      className={`mb-2.5 cursor-pointer rounded-xl border border-[#2b3743] border-l-4 bg-card p-3 shadow-card ${PRIORITY_BORDER[job.priority]}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", job.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onOpen}
    >
      <div className="flex justify-between gap-2">
        <div>
          <div className="font-bold leading-tight">{job.name}</div>
          <div className="mt-0.5 text-[13px] text-muted">{job.client}</div>
        </div>
        <span
          className={`h-fit rounded-full border border-current px-[6px] py-[3px] text-[10px] font-extrabold ${PRIORITY_TAG[job.priority]}`}
        >
          {job.priority}
        </span>
      </div>
      <div className="mb-[7px] mt-[9px] flex flex-wrap gap-[5px]">
        <span
          className={`rounded-full border px-[7px] py-[3px] text-[11px] font-bold ${MATERIALS_PILL[job.materials] ?? "border-[#52606e] text-[#bcc8d4]"}`}
        >
          Materials: {job.materials}
        </span>
        {total > 0 && (
          <span className="rounded-full border border-[#52606e] px-[7px] py-[3px] text-[11px] font-bold text-[#bcc8d4]">
            {done}/{total} subtasks
          </span>
        )}
      </div>
      <div className="grid gap-1 text-xs text-muted">
        <span>
          Lead: <b className="font-bold text-[#dce3ea]">{job.lead || "—"}</b>
        </span>
        <span>
          Due: <b className="font-bold text-[#dce3ea]">{job.due || "—"}</b>
        </span>
      </div>
      {selectedEmployee && (job.lead === selectedEmployee || employeeTasks.length > 0) && (
        <div className="mt-2 grid gap-1">
          {job.lead === selectedEmployee && employeeTasks.length === 0 && (
            <div className="rounded-lg border border-[#2b3743] bg-panel2 px-2 py-[5px] text-[13px] text-[#dce3ea]">
              Job lead — see full job for details
            </div>
          )}
          {employeeTasks.map((s) => (
            <div
              key={s.id}
              className={`rounded-lg border border-[#2b3743] bg-panel2 px-2 py-[5px] text-[13px] ${
                s.done ? "text-muted line-through" : "text-[#dce3ea]"
              }`}
            >
              {s.title}
              {s.due && <span className="ml-1 text-muted">· {s.due}</span>}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
