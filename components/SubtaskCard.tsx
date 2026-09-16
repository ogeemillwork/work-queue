"use client";

import { Job, Subtask } from "@/lib/types";
import { PRIORITY_COLORS, STATE_COLORS } from "./JobCard";

// A single subtask on the work board. Dragging carries both ids so the
// drop handler can find the subtask inside its job.
export const SUBTASK_DRAG_PREFIX = "subtask\n";

export default function SubtaskCard({
  job,
  subtask,
  onOpen,
}: {
  job: Job;
  subtask: Subtask;
  onOpen: () => void;
}) {
  return (
    <article
      className="mb-2.5 cursor-pointer rounded-xl border border-[#2b3743] border-l-4 bg-card p-3 shadow-card"
      style={{ borderLeftColor: PRIORITY_COLORS[job.priority] }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", `${SUBTASK_DRAG_PREFIX}${job.id}\n${subtask.id}`);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onOpen}
    >
      <div className="flex justify-between gap-2">
        <div>
          <div className={`font-bold leading-tight ${subtask.done ? "text-muted line-through" : ""}`}>
            {subtask.done ? "✓ " : ""}
            {subtask.title}
          </div>
          <div className="mt-0.5 text-[13px] text-muted">{job.name}</div>
        </div>
        <span
          className="h-fit shrink-0 rounded-full border border-current px-[6px] py-[3px] text-[10px] font-extrabold"
          style={{ color: STATE_COLORS[subtask.state ?? "Discovery"] }}
        >
          {subtask.state ?? "Discovery"}
        </span>
      </div>
      <div className="mt-[9px] flex flex-wrap gap-[5px]">
        <span className="rounded-full border border-warn px-[7px] py-[3px] text-[11px] font-bold text-[#f0c86c]">
          {subtask.employee || "Unassigned"}
        </span>
        {subtask.due && (
          <span className="rounded-full border border-[#52606e] px-[7px] py-[3px] text-[11px] font-bold text-[#bcc8d4]">
            Due {subtask.due}
          </span>
        )}
      </div>
    </article>
  );
}
