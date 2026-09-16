"use client";

import { JOB_STATES, Job, JobState, Priority } from "@/lib/types";

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

// One hue per pipeline stage, walking the spectrum from Discovery to Complete.
// Shared with the admin-mode color key on the board.
export const STATE_COLORS: Record<JobState, string> = {
  Discovery: "#94a3b8",
  Estimate: "#22d3ee",
  Design: "#38bdf8",
  Engineering: "#60a5fa",
  Approval: "#818cf8",
  Procurement: "#8b5cf6",
  "Pre-Production": "#a78bfa",
  "Final Dimensions": "#c084fc",
  Production: "#e879f9",
  FAB: "#f472b6",
  Cut: "#fb7185",
  Assembly: "#fb923c",
  Shipping: "#fbbf24",
  Pack: "#facc15",
  "Check Staging": "#fde047",
  Delivered: "#a3e635",
  Installation: "#4ade80",
  "Finish Coordination": "#34d399",
  Punch: "#2dd4bf",
  Closeout: "#14b8a6",
  Complete: "#22c55e",
  Adjustment: "#f87171",
};

// A job's states are derived: the distinct pipeline states of its open
// (not-done) subtasks, in pipeline order. With no open subtasks it falls
// back to the job's own stored state.
export function deriveJobStates(job: Job): JobState[] {
  const active = JOB_STATES.filter((st) =>
    job.subtasks.some((s) => !s.done && (s.state ?? "Discovery") === st)
  );
  return active.length ? active : [job.state ?? "Discovery"];
}

// Priority hues, for elements (like subtask cards) that color by the
// parent job's priority with inline styles.
export const PRIORITY_COLORS: Record<Priority, string> = {
  Urgent: "#a855f7",
  High: "#d85d5d",
  Medium: "#e0b45a",
  Low: "#5fb67a",
};

const MATERIALS_PILL: Record<string, string> = {
  Ready: "border-[#408254] text-[#8ee4a6]",
  Partial: "border-[#8d6c31] text-[#ebc66f]",
  Waiting: "border-[#924949] text-[#ff9696]",
};

export default function JobCard({
  job,
  colorBy = "priority",
  selectedEmployee = "",
  onOpen,
}: {
  job: Job;
  colorBy?: "priority" | "state";
  selectedEmployee?: string;
  onOpen: () => void;
}) {
  const done = job.subtasks.filter((s) => s.done).length;
  const total = job.subtasks.length;
  const employeeTasks = selectedEmployee ? job.subtasks.filter((s) => s.employee === selectedEmployee) : [];
  const byState = colorBy === "state";
  const states = deriveJobStates(job);

  return (
    <article
      className={`mb-2.5 cursor-pointer rounded-xl border border-[#2b3743] border-l-4 bg-card p-3 shadow-card ${
        byState ? "" : PRIORITY_BORDER[job.priority]
      }`}
      style={byState ? { borderLeftColor: STATE_COLORS[states[0]] } : undefined}
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
        <div className="flex max-w-[45%] flex-wrap justify-end gap-1">
          {byState ? (
            states.map((s) => (
              <span
                key={s}
                className="h-fit shrink-0 rounded-full border border-current px-[6px] py-[3px] text-[10px] font-extrabold"
                style={{ color: STATE_COLORS[s] }}
              >
                {s}
              </span>
            ))
          ) : (
            <span
              className={`h-fit shrink-0 rounded-full border border-current px-[6px] py-[3px] text-[10px] font-extrabold ${PRIORITY_TAG[job.priority]}`}
            >
              {job.priority}
            </span>
          )}
        </div>
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
