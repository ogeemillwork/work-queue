"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { JOB_STATES_ALPHA, Job, JobState, Materials, PIPELINE, Priority, StateTemplate, Status, Subtask } from "@/lib/types";
import { newRoom, setRoomState } from "@/lib/rooms";
import { STATE_COLORS } from "./JobCard";

// The editable parts of a job, shared by the job page (one per column) and
// the job dialog (one per tab). Each edits a draft; the caller saves it.

type SetDraft = Dispatch<SetStateAction<Job>>;

export const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";
export const dateCls =
  "w-full rounded-[10px] border border-[#d2d7dd] bg-white px-2.5 py-[9px] text-[#111] [color-scheme:light]";
export const labelCls = "mb-3 grid gap-[5px] text-[13px] [font-weight:650]";
const smallCls = "w-full rounded-[8px] border border-line bg-[#0f151c] px-2 py-[6px] text-[13px] text-ink";
const smallDateCls =
  "w-full rounded-[8px] border border-[#d2d7dd] bg-white px-2 py-[6px] text-[13px] text-[#111] [color-scheme:light]";
const btnCls = "rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold";
const xBtnCls = "shrink-0 rounded-[8px] border border-line bg-panel2 px-2 py-[3px] text-xs font-bold";

/** Trim the free-text fields before saving. */
export function cleanJob(d: Job): Job {
  return {
    ...d,
    name: d.name.trim(),
    client: d.client.trim(),
    clientPhone: (d.clientPhone ?? "").trim(),
    clientEmail: (d.clientEmail ?? "").trim(),
    notes: d.notes.trim(),
    dropbox: d.dropbox.trim(),
    handoff: d.handoff.trim(),
  };
}

// keep a name visible in a select even if it was removed from the employee list
function withCurrent(employees: string[], current: string): string[] {
  return current && !employees.includes(current) ? [current, ...employees] : employees;
}

export function RoomsSection({
  draft,
  setDraft,
  templates,
}: {
  draft: Job;
  setDraft: SetDraft;
  templates: StateTemplate[];
}) {
  const [newName, setNewName] = useState("");

  function addRoom() {
    const name = newName.trim();
    if (!name) return;
    const created = newRoom(name, templates);
    setDraft((d) => ({ ...d, rooms: [...d.rooms, created.room], subtasks: [...d.subtasks, ...created.subtasks] }));
    setNewName("");
  }

  function removeRoom(id: string, name: string) {
    const count = draft.subtasks.filter((s) => s.roomId === id).length;
    if (!confirm(`Remove ${name}${count ? ` and its ${count} subtask${count === 1 ? "" : "s"}` : ""}?`)) return;
    setDraft((d) => ({
      ...d,
      rooms: d.rooms.filter((r) => r.id !== id),
      subtasks: d.subtasks.filter((s) => s.roomId !== id),
    }));
  }

  return (
    <div>
      <p className="mb-2.5 text-[12px] text-muted">
        Each room moves through the pipeline on its own: once its tasks for the current state are done it advances and
        picks up the next state&apos;s template tasks. Change a state here to move a room by hand.
      </p>
      {draft.rooms.length === 0 && <p className="py-2 text-[13px] text-muted">No rooms yet — add one below.</p>}
      {draft.rooms.map((room) => {
        const current = draft.subtasks.filter((s) => s.roomId === room.id && (s.state ?? "Discovery") === room.state);
        return (
          <div
            key={room.id}
            className="mb-2.5 rounded-xl border border-[#2b3743] border-l-4 bg-card p-2.5"
            style={{ borderLeftColor: STATE_COLORS[room.state] }}
          >
            <div className="flex items-center gap-2">
              <input
                className={`${smallCls} font-bold`}
                aria-label="Room name"
                value={room.name}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    rooms: d.rooms.map((r) => (r.id === room.id ? { ...r, name: e.target.value } : r)),
                  }))
                }
              />
              <button className={xBtnCls} aria-label={`Remove ${room.name}`} onClick={() => removeRoom(room.id, room.name)}>
                ×
              </button>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
              <select
                className={smallCls}
                aria-label={`State of ${room.name}`}
                style={{ color: STATE_COLORS[room.state] }}
                value={room.state}
                onChange={(e) => setDraft((d) => setRoomState(d, room.id, e.target.value as JobState, templates))}
              >
                {[...PIPELINE, "Adjustment" as JobState].map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>
              <span className="text-[12px] text-muted">
                {current.filter((s) => s.done).length}/{current.length} done
              </span>
            </div>
          </div>
        );
      })}
      <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
        <input
          className={inputCls}
          placeholder="New room (e.g. Kitchen)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRoom()}
        />
        <button className={btnCls} onClick={addRoom}>
          Add
        </button>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  rooms,
  employees,
  onChange,
  onRemove,
}: {
  task: Subtask;
  rooms: Job["rooms"];
  employees: string[];
  onChange: (patch: Partial<Subtask>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mb-2 rounded-xl border border-[#2b3743] bg-card p-2.5">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-accent"
          aria-label={`Done: ${task.title}`}
          checked={task.done}
          onChange={(e) => onChange({ done: e.target.checked, status: e.target.checked ? "Complete" : "Queued" })}
        />
        <input
          className={`${smallCls} ${task.done ? "text-muted line-through" : ""}`}
          aria-label="Task title"
          value={task.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
        <button className={xBtnCls} aria-label={`Remove ${task.title}`} onClick={onRemove}>
          ×
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          className={smallCls}
          aria-label="Room"
          value={task.roomId ?? ""}
          onChange={(e) => onChange({ roomId: e.target.value || undefined })}
        >
          {!task.roomId && <option value="">No room</option>}
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          className={smallCls}
          aria-label="Assigned to"
          value={task.employee}
          onChange={(e) => onChange({ employee: e.target.value })}
        >
          <option value="">Unassigned</option>
          {withCurrent(employees, task.employee).map((emp) => (
            <option key={emp}>{emp}</option>
          ))}
        </select>
        <select
          className={smallCls}
          aria-label="Pipeline state"
          style={{ color: STATE_COLORS[task.state ?? "Discovery"] }}
          value={task.state ?? "Discovery"}
          onChange={(e) => onChange({ state: e.target.value as JobState })}
        >
          {JOB_STATES_ALPHA.map((st) => (
            <option key={st}>{st}</option>
          ))}
        </select>
        <input
          type="date"
          className={smallDateCls}
          aria-label="Due date"
          value={task.due}
          onChange={(e) => onChange({ due: e.target.value })}
        />
      </div>
    </div>
  );
}

function AddTask({ placeholder, onAdd }: { placeholder: string; onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  const add = () => {
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  };
  return (
    <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
      <input
        className={smallCls}
        placeholder={placeholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
      />
      <button className={xBtnCls} onClick={add}>
        Add
      </button>
    </div>
  );
}

export function TasksSection({
  draft,
  setDraft,
  employees,
}: {
  draft: Job;
  setDraft: SetDraft;
  employees: string[];
}) {
  const patch = (id: string, p: Partial<Subtask>) =>
    setDraft((d) => ({ ...d, subtasks: d.subtasks.map((s) => (s.id === id ? { ...s, ...p } : s)) }));
  const remove = (id: string) => setDraft((d) => ({ ...d, subtasks: d.subtasks.filter((s) => s.id !== id) }));
  const add = (title: string, roomId: string | undefined, state: JobState) =>
    setDraft((d) => ({
      ...d,
      subtasks: [
        ...d.subtasks,
        { id: `st-${Date.now()}`, title, employee: "", due: "", done: false, status: "Queued", state, roomId },
      ],
    }));

  // Group by room in room order; tasks without a (known) room go last.
  const roomIds = new Set(draft.rooms.map((r) => r.id));
  const orphans = draft.subtasks.filter((s) => !s.roomId || !roomIds.has(s.roomId));
  const groups = [
    ...draft.rooms.map((r) => ({ key: r.id, room: r, tasks: draft.subtasks.filter((s) => s.roomId === r.id) })),
    ...(orphans.length ? [{ key: "none", room: null, tasks: orphans }] : []),
  ];

  return (
    <div>
      {groups.length === 0 && <p className="py-2 text-[13px] text-muted">Add a room to start adding tasks.</p>}
      {groups.map(({ key, room, tasks }) => (
        <section key={key}>
          {(draft.rooms.length > 1 || !room) && (
            <h3 className="mb-1.5 mt-1 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.08em] text-muted">
              {room ? room.name : "No room"}
              {room && <span style={{ color: STATE_COLORS[room.state] }}>{room.state}</span>}
            </h3>
          )}
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              rooms={draft.rooms}
              employees={employees}
              onChange={(p) => patch(t.id, p)}
              onRemove={() => remove(t.id)}
            />
          ))}
          {room && (
            <AddTask
              placeholder={draft.rooms.length > 1 ? `New ${room.name} task` : "New task"}
              onAdd={(title) => add(title, room.id, room.state)}
            />
          )}
        </section>
      ))}
    </div>
  );
}

export function LinksSection({ draft, setDraft }: { draft: Job; setDraft: SetDraft }) {
  return (
    <div>
      <label className={labelCls}>
        Dropbox Job Folder
        <input
          className={inputCls}
          placeholder="https://…"
          value={draft.dropbox}
          onChange={(e) => setDraft((d) => ({ ...d, dropbox: e.target.value }))}
        />
      </label>
      {/^https?:\/\//.test(draft.dropbox.trim()) && (
        <a
          href={draft.dropbox.trim()}
          target="_blank"
          rel="noreferrer"
          className="-mt-1.5 mb-3 block truncate text-[13px] font-bold text-[#8ec8ef] underline"
        >
          Open folder ↗
        </a>
      )}
      <label className={labelCls}>
        ChatGPT Job Handoff
        <textarea
          className={`${inputCls} resize-y`}
          rows={10}
          placeholder="Paste project context, prompts, or handoff notes here"
          value={draft.handoff}
          onChange={(e) => setDraft((d) => ({ ...d, handoff: e.target.value }))}
        />
      </label>
    </div>
  );
}

export function DetailsSection({
  draft,
  setDraft,
  clients,
  employees,
  priorities,
  statuses,
  gridCls = "grid grid-cols-1 gap-x-3",
}: {
  draft: Job;
  setDraft: SetDraft;
  clients: string[];
  employees: string[];
  priorities: Priority[];
  statuses: Status[];
  gridCls?: string;
}) {
  function set<K extends keyof Job>(key: K, value: Job[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  return (
    <div>
      <div className={gridCls}>
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
          <input type="tel" className={inputCls} value={draft.clientPhone ?? ""} onChange={(e) => set("clientPhone", e.target.value)} />
        </label>
        <label className={labelCls}>
          Client email
          <input type="email" className={inputCls} value={draft.clientEmail ?? ""} onChange={(e) => set("clientEmail", e.target.value)} />
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
            {withCurrent(employees, draft.lead).map((emp) => (
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
    </div>
  );
}
