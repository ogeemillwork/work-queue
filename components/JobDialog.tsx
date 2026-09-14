"use client";

import { useState } from "react";
import { Job, Materials, Priority, Status, Subtask } from "@/lib/types";

type Tab = "details" | "subtasks" | "links";

const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "subtasks", label: "Subtasks" },
  { id: "links", label: "Links" },
];

const WORKFLOW: { status: Status; label: string; className: string }[] = [
  { status: "In Progress", label: "START", className: "bg-[#e0f0e7]" },
  { status: "Blocked", label: "BLOCKED", className: "bg-[#f5dfd6]" },
  { status: "Complete", label: "COMPLETE", className: "bg-[#dde8f6]" },
];

const inputCls = "w-full rounded-lg border border-line bg-white px-2.5 py-[9px]";
const labelCls = "mb-3 grid gap-[5px] text-[13px] [font-weight:650]";

export default function JobDialog({
  job,
  isNew,
  employees,
  priorities,
  statuses,
  onSave,
  onDelete,
  onClose,
}: {
  job: Job;
  isNew: boolean;
  employees: string[];
  priorities: Priority[];
  statuses: Status[];
  onSave: (job: Job) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Job>(() => JSON.parse(JSON.stringify(job)));
  const [tab, setTab] = useState<Tab>("details");
  const [newTitle, setNewTitle] = useState("");
  const [newEmployee, setNewEmployee] = useState(employees[0] ?? "");
  const [newDue, setNewDue] = useState("");

  function set<K extends keyof Job>(key: K, value: Job[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setSubtask(i: number, patch: Partial<Subtask>) {
    setDraft((d) => ({
      ...d,
      subtasks: d.subtasks.map((s, si) => (si === i ? { ...s, ...patch } : s)),
    }));
  }

  function addSubtask() {
    const title = newTitle.trim();
    if (!title) return;
    setDraft((d) => ({
      ...d,
      subtasks: [...d.subtasks, { id: `st-${Date.now()}`, title, employee: newEmployee, due: newDue, done: false }],
    }));
    setNewTitle("");
    setNewDue("");
  }

  function save() {
    const name = draft.name.trim();
    if (!name) return;
    onSave({ ...draft, name, client: draft.client.trim(), notes: draft.notes.trim(), dropbox: draft.dropbox.trim(), handoff: draft.handoff.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-[850px] rounded-[14px] bg-white p-[18px] shadow-dialog"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{isNew ? "Add Job" : "Job Details"}</h2>
            <div className="text-[13px] text-muted">{isNew ? "New local job" : job.name}</div>
          </div>
          <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mb-3.5 mt-[18px] flex gap-1 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`border-b-[3px] px-3 py-[9px] ${tab === t.id ? "border-accent font-bold" : "border-transparent"}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "details" && (
          <section>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className={labelCls}>
                Job name
                <input className={inputCls} value={draft.name} onChange={(e) => set("name", e.target.value)} required />
              </label>
              <label className={labelCls}>
                Client
                <input className={inputCls} value={draft.client} onChange={(e) => set("client", e.target.value)} />
              </label>
              <label className={labelCls}>
                Priority
                <select className={inputCls} value={draft.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
                  {priorities.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                Status
                <select className={inputCls} value={draft.status} onChange={(e) => set("status", e.target.value as Status)}>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                Lead
                <select className={inputCls} value={draft.lead} onChange={(e) => set("lead", e.target.value)}>
                  {employees.map((emp) => (
                    <option key={emp}>{emp}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                Due date
                <input type="date" className={inputCls} value={draft.due} onChange={(e) => set("due", e.target.value)} />
              </label>
            </div>
            <label className={labelCls}>
              Material readiness
              <select className={inputCls} value={draft.materials} onChange={(e) => set("materials", e.target.value as Materials)}>
                <option value="Ready">Ready</option>
                <option value="Partial">Partial</option>
                <option value="Waiting">Waiting</option>
              </select>
            </label>
            <label className={labelCls}>
              Notes
              <textarea className={`${inputCls} resize-y`} rows={5} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
            </label>
            <div className="flex gap-2">
              {WORKFLOW.map((w) => (
                <button
                  key={w.status}
                  className={`rounded-lg border border-line px-[11px] py-2 font-extrabold ${w.className}`}
                  onClick={() => set("status", w.status)}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === "subtasks" && (
          <section>
            <div>
              {draft.subtasks.map((s, i) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[auto_1fr] items-center gap-2 border-b border-[#eee] py-[9px] md:grid-cols-[auto_1fr_150px_135px_auto]"
                >
                  <input type="checkbox" checked={s.done} onChange={(e) => setSubtask(i, { done: e.target.checked })} />
                  <input
                    className={`${inputCls} ${s.done ? "text-muted line-through" : ""}`}
                    value={s.title}
                    onChange={(e) => setSubtask(i, { title: e.target.value })}
                  />
                  <select
                    className={`${inputCls} md:col-auto col-start-2`}
                    value={s.employee}
                    onChange={(e) => setSubtask(i, { employee: e.target.value })}
                  >
                    {employees.map((emp) => (
                      <option key={emp}>{emp}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className={`${inputCls} md:col-auto col-start-2`}
                    value={s.due}
                    onChange={(e) => setSubtask(i, { due: e.target.value })}
                  />
                  <button
                    className="rounded-lg border border-line bg-white px-[11px] py-2"
                    onClick={() => setDraft((d) => ({ ...d, subtasks: d.subtasks.filter((_, si) => si !== i) }))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 md:grid-cols-[1fr_150px_135px_auto]">
              <input className={inputCls} placeholder="New subtask" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <select className={`${inputCls} col-start-1 md:col-auto`} value={newEmployee} onChange={(e) => setNewEmployee(e.target.value)}>
                {employees.map((emp) => (
                  <option key={emp}>{emp}</option>
                ))}
              </select>
              <input type="date" className={`${inputCls} col-start-1 md:col-auto`} value={newDue} onChange={(e) => setNewDue(e.target.value)} />
              <button className="rounded-lg border border-line bg-white px-[11px] py-2" onClick={addSubtask}>
                Add
              </button>
            </div>
          </section>
        )}

        {tab === "links" && (
          <section>
            <label className={labelCls}>
              Dropbox Job Folder
              <input className={inputCls} placeholder="https://…" value={draft.dropbox} onChange={(e) => set("dropbox", e.target.value)} />
            </label>
            <label className={labelCls}>
              ChatGPT Job Handoff
              <textarea
                className={`${inputCls} resize-y`}
                rows={8}
                placeholder="Paste project context, prompts, or handoff notes here"
                value={draft.handoff}
                onChange={(e) => set("handoff", e.target.value)}
              />
            </label>
          </section>
        )}

        <div className="mt-[18px] flex gap-2 border-t border-line pt-3.5">
          {!isNew && (
            <button className="rounded-lg border border-danger bg-danger px-[11px] py-2 text-white" onClick={onDelete}>
              Delete Job
            </button>
          )}
          <span className="flex-1" />
          <button className="rounded-lg border border-line bg-white px-[11px] py-2" onClick={onClose}>
            Cancel
          </button>
          <button className="rounded-lg border border-accent bg-accent px-[11px] py-2 text-white" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
