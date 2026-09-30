"use client";

import { useState } from "react";
import { JOB_STATES_ALPHA, Job, JobState, Materials, PIPELINE, Priority, StateTemplate, Status, Subtask } from "@/lib/types";
import { newRoom, setRoomState } from "@/lib/rooms";
import { STATE_COLORS } from "./JobCard";

type Tab = "details" | "rooms" | "subtasks" | "links";

const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "rooms", label: "Rooms" },
  { id: "subtasks", label: "Subtasks" },
  { id: "links", label: "Links" },
];

const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";
const dateCls = "w-full rounded-[10px] border border-[#d2d7dd] bg-white px-2.5 py-[9px] text-[#111] [color-scheme:light]";
const labelCls = "mb-3 grid gap-[5px] text-[13px] [font-weight:650]";

export default function JobDialog({
  job,
  isNew,
  canEdit,
  clients,
  employees,
  priorities,
  statuses,
  templates,
  onSave,
  onDelete,
  onClose,
}: {
  job: Job;
  isNew: boolean;
  canEdit: boolean;
  clients: string[];
  employees: string[];
  priorities: Priority[];
  statuses: Status[];
  templates: StateTemplate[];
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
  const [newState, setNewState] = useState<JobState>(job.rooms[0]?.state ?? "Discovery");
  const [newRoomId, setNewRoomId] = useState(job.rooms[0]?.id ?? "");
  const [newRoomName, setNewRoomName] = useState("");

  const roomName = (id?: string) => draft.rooms.find((r) => r.id === id)?.name ?? "";

  function addRoom() {
    const name = newRoomName.trim();
    if (!name) return;
    const created = newRoom(name, templates);
    setDraft((d) => ({ ...d, rooms: [...d.rooms, created.room], subtasks: [...d.subtasks, ...created.subtasks] }));
    if (!newRoomId) setNewRoomId(created.room.id);
    setNewRoomName("");
  }

  function removeRoom(id: string) {
    const count = draft.subtasks.filter((s) => s.roomId === id).length;
    if (!confirm(`Remove ${roomName(id)}${count ? ` and its ${count} subtask${count === 1 ? "" : "s"}` : ""}?`)) return;
    setDraft((d) => ({
      ...d,
      rooms: d.rooms.filter((r) => r.id !== id),
      subtasks: d.subtasks.filter((s) => s.roomId !== id),
    }));
    if (newRoomId === id) setNewRoomId(draft.rooms.find((r) => r.id !== id)?.id ?? "");
  }

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
      subtasks: [
        ...d.subtasks,
        {
          id: `st-${Date.now()}`,
          title,
          employee: newEmployee,
          due: newDue,
          done: false,
          status: "Queued",
          state: newState,
          roomId: newRoomId || undefined,
        },
      ],
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
    onSave({
      ...draft,
      name,
      client: draft.client.trim(),
      clientPhone: (draft.clientPhone ?? "").trim(),
      clientEmail: (draft.clientEmail ?? "").trim(),
      notes: draft.notes.trim(),
      dropbox: draft.dropbox.trim(),
      handoff: draft.handoff.trim(),
    });
  }

  if (!editMode) {
    const linkCls = "text-[#8ec8ef] underline";
    const info: [string, React.ReactNode][] = [
      ["Client", job.client || "—"],
      ["Client phone", job.clientPhone ? <a key="p" className={linkCls} href={`tel:${job.clientPhone}`}>{job.clientPhone}</a> : "—"],
      ["Client email", job.clientEmail ? <a key="e" className={linkCls} href={`mailto:${job.clientEmail}`}>{job.clientEmail}</a> : "—"],
      ["Priority", job.priority],
      ["Status", job.status],
      [
        "Rooms",
        <span key="s" className="flex flex-wrap gap-1">
          {job.rooms.length === 0 && "—"}
          {job.rooms.map((r) => (
            <span
              key={r.id}
              className="rounded-full border border-current px-[6px] py-[2px] text-[10px] font-extrabold"
              style={{ color: STATE_COLORS[r.state] }}
            >
              {r.name} · {r.state}
            </span>
          ))}
        </span>,
      ],
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
                      {job.rooms.length > 1 && roomName(s.roomId) ? `${roomName(s.roomId)} · ` : ""}
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
                <input
                  className={inputCls}
                  list="job-client-options"
                  placeholder="Pick a client or type a new one"
                  value={draft.client}
                  onChange={(e) => set("client", e.target.value)}
                />
                <datalist id="job-client-options">
                  {[...clients].sort().map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
              <label className={labelCls}>
                Client phone
                <input
                  type="tel"
                  className={inputCls}
                  value={draft.clientPhone ?? ""}
                  onChange={(e) => set("clientPhone", e.target.value)}
                />
              </label>
              <label className={labelCls}>
                Client email
                <input
                  type="email"
                  className={inputCls}
                  value={draft.clientEmail ?? ""}
                  onChange={(e) => set("clientEmail", e.target.value)}
                />
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
          </section>
        )}

        {tab === "rooms" && (
          <section>
            <p className="mb-2 text-[13px] text-muted">
              Each room moves through the pipeline on its own: once all of its subtasks for the current state are done
              it advances, picking up the next state&apos;s template tasks. Change a room&apos;s state here to move it by hand.
            </p>
            {draft.rooms.length === 0 && <p className="py-2 text-[13px] text-muted">No rooms yet — add one below.</p>}
            {draft.rooms.map((room) => {
              const current = draft.subtasks.filter((s) => s.roomId === room.id && (s.state ?? "Discovery") === room.state);
              return (
                <div
                  key={room.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line py-[9px] md:grid-cols-[1fr_190px_90px_auto]"
                >
                  <input
                    className={inputCls}
                    aria-label="Room name"
                    value={room.name}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        rooms: d.rooms.map((r) => (r.id === room.id ? { ...r, name: e.target.value } : r)),
                      }))
                    }
                  />
                  <select
                    className={`${inputCls} col-start-1 md:col-auto`}
                    aria-label={`State of ${room.name}`}
                    style={{ color: STATE_COLORS[room.state] }}
                    value={room.state}
                    onChange={(e) => setDraft((d) => setRoomState(d, room.id, e.target.value as JobState, templates))}
                  >
                    {[...PIPELINE, "Adjustment" as JobState].map((st) => (
                      <option key={st}>{st}</option>
                    ))}
                  </select>
                  <span className="col-start-1 text-[12px] text-muted md:col-auto">
                    {current.filter((s) => s.done).length}/{current.length} done
                  </span>
                  <button
                    className="col-start-2 row-start-1 rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold md:col-auto md:row-auto"
                    aria-label={`Remove ${room.name}`}
                    onClick={() => removeRoom(room.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <input
                className={inputCls}
                placeholder="New room (e.g. Kitchen)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRoom()}
              />
              <button className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold" onClick={addRoom}>
                Add room
              </button>
            </div>
          </section>
        )}

        {tab === "subtasks" && (
          <section>
            <div>
              {draft.subtasks.map((s, i) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[auto_1fr] items-center gap-2 border-b border-line py-[9px] md:grid-cols-[auto_1fr_120px_120px_140px_125px_auto]"
                >
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={s.done}
                    onChange={(e) =>
                      setSubtask(i, { done: e.target.checked, status: e.target.checked ? "Complete" : "Queued" })
                    }
                  />
                  <input
                    className={`${inputCls} ${s.done ? "text-muted line-through" : ""}`}
                    value={s.title}
                    onChange={(e) => setSubtask(i, { title: e.target.value })}
                  />
                  <select
                    className={`${inputCls} md:col-auto col-start-2`}
                    aria-label="Room"
                    value={s.roomId ?? ""}
                    onChange={(e) => setSubtask(i, { roomId: e.target.value || undefined })}
                  >
                    {!s.roomId && <option value="">No room</option>}
                    {draft.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${inputCls} md:col-auto col-start-2`}
                    value={s.employee}
                    onChange={(e) => setSubtask(i, { employee: e.target.value })}
                  >
                    {withCurrent(s.employee).map((emp) => (
                      <option key={emp}>{emp}</option>
                    ))}
                  </select>
                  <select
                    className={`${inputCls} md:col-auto col-start-2`}
                    aria-label="Pipeline state"
                    value={s.state ?? "Discovery"}
                    onChange={(e) => setSubtask(i, { state: e.target.value as JobState })}
                  >
                    {JOB_STATES_ALPHA.map((st) => (
                      <option key={st}>{st}</option>
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
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 md:grid-cols-[1fr_120px_120px_140px_125px_auto]">
              <input className={inputCls} placeholder="New subtask" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <select
                className={`${inputCls} col-start-1 md:col-auto`}
                aria-label="Room for new subtask"
                value={newRoomId}
                onChange={(e) => {
                  setNewRoomId(e.target.value);
                  const room = draft.rooms.find((r) => r.id === e.target.value);
                  if (room) setNewState(room.state);
                }}
              >
                {draft.rooms.length === 0 && <option value="">No room</option>}
                {draft.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select className={`${inputCls} col-start-1 md:col-auto`} value={newEmployee} onChange={(e) => setNewEmployee(e.target.value)}>
                {employees.map((emp) => (
                  <option key={emp}>{emp}</option>
                ))}
              </select>
              <select
                className={`${inputCls} col-start-1 md:col-auto`}
                aria-label="Pipeline state for new subtask"
                value={newState}
                onChange={(e) => setNewState(e.target.value as JobState)}
              >
                {JOB_STATES_ALPHA.map((st) => (
                  <option key={st}>{st}</option>
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
