"use client";

import { useState } from "react";
import { JOB_STATES, Job, JobState, Status, Subtask } from "@/lib/types";

const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";
const dateCls =
  "w-full rounded-[10px] border border-[#d2d7dd] bg-white px-2.5 py-[9px] text-[#111] [color-scheme:light]";
const labelCls = "mb-3 grid gap-[5px] text-[13px] [font-weight:650]";

export default function SubtaskDialog({
  job,
  subtask,
  employees,
  statuses,
  onSave,
  onDelete,
  onOpenJob,
  onClose,
}: {
  job: Job;
  subtask: Subtask;
  employees: string[];
  statuses: Status[];
  onSave: (subtask: Subtask) => void;
  onDelete: () => void;
  onOpenJob: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Subtask>({ ...subtask });

  // keep a name visible in the select even if it left the employee list
  const employeeOptions =
    draft.employee && !employees.includes(draft.employee) ? [draft.employee, ...employees] : employees;

  function set<K extends keyof Subtask>(key: K, value: Subtask[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function save() {
    const title = draft.title.trim();
    if (!title) return;
    const status = draft.status ?? "Queued";
    onSave({ ...draft, title, status, done: status === "Complete" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-[480px] rounded-[18px] border border-line bg-[#151c24] p-[18px] shadow-dialog"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Subtask</h2>
            <button className="text-[13px] text-[#8ec8ef] underline" onClick={onOpenJob}>
              {job.name}
            </button>
          </div>
          <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-4">
          <label className={labelCls}>
            Task
            <input className={inputCls} value={draft.title} onChange={(e) => set("title", e.target.value)} required />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelCls}>
              Assigned to
              <select className={inputCls} value={draft.employee} onChange={(e) => set("employee", e.target.value)}>
                {!draft.employee && <option value="">Unassigned</option>}
                {employeeOptions.map((emp) => (
                  <option key={emp}>{emp}</option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Status
              <select
                className={inputCls}
                value={draft.status ?? "Queued"}
                onChange={(e) => set("status", e.target.value as Status)}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelCls}>
              Pipeline state
              <select
                className={inputCls}
                value={draft.state ?? "Discovery"}
                onChange={(e) => set("state", e.target.value as JobState)}
              >
                {JOB_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Due date
              <input type="date" className={dateCls} value={draft.due} onChange={(e) => set("due", e.target.value)} />
            </label>
          </div>
        </div>

        <div className="mt-[18px] flex gap-2 border-t border-line pt-3.5">
          <button
            className="rounded-[10px] border border-[#6d3232] bg-[#3b1d1d] px-[11px] py-2 font-bold text-[#ffb8b8]"
            onClick={onDelete}
          >
            Delete
          </button>
          <span className="flex-1" />
          <button className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded-[10px] border border-warn bg-accent px-[11px] py-2 font-bold text-[#17130c]"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
