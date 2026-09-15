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
  { status: "In Progress", label: "▶ START", className: "border-[#2c7042] bg-[#193824] text-[#9ef1b5]" },
  { status: "Blocked", label: "! BLOCKED", className: "border-[#8a4b3b] bg-[#442821] text-[#ffc1ae]" },
  { status: "Complete", label: "✓ COMPLETE", className: "border-[#35688d] bg-[#173247] text-[#9bd1f6]" },
];

const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";
const dateCls = "w-full rounded-[10px] border border-[#d2d7dd] bg-white px-2.5 py-[9px] text-[#111] [color-scheme:light]";
const labelCls = "mb-3 grid gap-[5px] text-[13px] [font-weight:650]";

export default function JobDialog({
  job,
  isNew,
  canEdit,
  employees,
  priorities,
  statuses,
  onSave,
  onDelete,
  onClose,
}: {
  job: Job;
  isNew: boolean;
  canEdit: boolean;
  employees: string[];
  priorities: Priority[];
  statuses: Status[];
  onSave: (job: Job) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Job>(() => JSON.parse(JSON.stringify(job)));
  const [editMode, setEditMode] = useState(isNew);
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

  // keep a name visible in a select even if it was removed from the employee list
  function withCurrent(current: string): string[] {
    return current && !employees.includes(current) ? [current, ...employees] : employees;
  }

  function save() {
    const name = draft.name.trim();
    if (!name) return;
    onSave({ ...draft, name, client: draft.client.trim(), notes: draft.notes.trim(), dropbox: draft.dropbox.trim(), handoff: draft.handoff.trim() });
  }

  if (!editMode) {
    const info: [string, string][] = [
      ["Client", job.client || "—"],
      ["Priority", job.priority],
      ["Status", job.status],
      ["Lead", job.lead || "—"],
      ["Due date", job.due || "—"],
      ["Materials", job.materials],
    ];
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={onClose}>
        <div
          className="w-full max-w-[640px] rounded-[18px] border border-line bg-[#151c24] p-[18px] shadow-dialog"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{job.name}</h2>
              <div className="text-[13px] text-muted">{job.client}</div>
            </div>
            <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-3">
            {info.map(([label, value]) => (
              <div key={label}>
                <div className="text-[11px] uppercase tracking-[.06em] text-muted">{label}</div>
                <div className="text-[14px] font-bold">{value}</div>
              </div>
            ))}
          </div>

          {job.notes && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[.06em] text-muted">Notes</div>
              <p className="mt-1 whitespace-pre-wrap text-[14px]">{job.notes}</p>
            </div>
          )}

          {job.subtasks.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[.06em] text-muted">Subtasks</div>
              <div className="mt-1 grid gap-1">
                {job.subtasks.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-baseline justify-between gap-2 rounded-lg border border-[#2b3743] bg-panel2 px-2.5 py-[6px] text-[14px] ${
                      s.done ? "text-muted line-through" : ""
                    }`}
                  >
                    <span>
                      {s.done ? "✓ " : ""}
                      {s.title}
                    </span>
                    <span className="shrink-0 text-[12px] text-muted">
                      {s.employee}
                      {s.due ? ` · ${s.due}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.dropbox && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[.06em] text-muted">Dropbox Job Folder</div>
              <a href={job.dropbox} target="_blank" rel="noreferrer" className="text-[14px] font-bold text-[#8ec8ef] underline">
                {job.dropbox}
              </a>
            </div>
          )}

          {job.handoff && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[.06em] text-muted">Job Handoff</div>
              <p className="mt-1 whitespace-pre-wrap text-[14px]">{job.handoff}</p>
            </div>
          )}

          <div className="mt-[18px] flex gap-2 border-t border-line pt-3.5">
            <span className="flex-1" />
            <button className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold" onClick={onClose}>
              Close
            </button>
            {canEdit && (
              <button
                className="rounded-[10px] border border-warn bg-accent px-[11px] py-2 font-bold text-[#17130c]"
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-[850px] rounded-[18px] border border-line bg-[#151c24] p-[18px] shadow-dialog"
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

        <div className="mb-3.5 mt-[18px] flex gap-[7px] border-b border-line pb-2.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`rounded-[9px] border px-2.5 py-[7px] text-[12px] font-extrabold ${tab === t.id ? "border-accent bg-accent text-[#17130c]" : "border-line bg-card text-muted"}`}
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
                  {withCurrent(draft.lead).map((emp) => (
                    <option key={emp}>{emp}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                Due date
                <input type="date" className={dateCls} value={draft.due} onChange={(e) => set("due", e.target.value)} />
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
                  className={`rounded-[10px] border px-[11px] py-2 text-[12px] font-extrabold ${w.className}`}
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
                  className="grid grid-cols-[auto_1fr] items-center gap-2 border-b border-line py-[9px] md:grid-cols-[auto_1fr_150px_135px_auto]"
                >
                  <input type="checkbox" className="accent-accent" checked={s.done} onChange={(e) => setSubtask(i, { done: e.target.checked })} />
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
                    {withCurrent(s.employee).map((emp) => (
                      <option key={emp}>{emp}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className={`${dateCls} md:col-auto col-start-2`}
                    value={s.due}
                    onChange={(e) => setSubtask(i, { due: e.target.value })}
                  />
                  <button
                    className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold"
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
              <input type="date" className={`${dateCls} col-start-1 md:col-auto`} value={newDue} onChange={(e) => setNewDue(e.target.value)} />
              <button className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold" onClick={addSubtask}>
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
            <button className="rounded-[10px] border border-[#6d3232] bg-[#3b1d1d] px-[11px] py-2 font-bold text-[#ffb8b8]" onClick={onDelete}>
              Delete Job
            </button>
          )}
          <span className="flex-1" />
          <button
            className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold"
            onClick={() => {
              if (isNew) {
                onClose();
              } else {
                setDraft(JSON.parse(JSON.stringify(job)));
                setEditMode(false);
              }
            }}
          >
            Cancel
          </button>
          <button className="rounded-[10px] border border-warn bg-accent px-[11px] py-2 font-bold text-[#17130c]" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
