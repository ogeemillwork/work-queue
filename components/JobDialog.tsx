"use client";

import { useState } from "react";
import { Job, Priority, StateTemplate, Status } from "@/lib/types";
import { STATE_COLORS } from "./JobCard";
import { DetailsSection, LinksSection, RoomsSection, TasksSection, cleanJob } from "./JobSections";

type Tab = "details" | "rooms" | "subtasks" | "links";

const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "rooms", label: "Rooms" },
  { id: "subtasks", label: "Subtasks" },
  { id: "links", label: "Links" },
];

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
  const roomName = (id?: string) => job.rooms.find((r) => r.id === id)?.name ?? "";

  function save() {
    const cleaned = cleanJob(draft);
    if (!cleaned.name) return;
    onSave(cleaned);
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
          <DetailsSection
            draft={draft}
            setDraft={setDraft}
            clients={clients}
            employees={employees}
            priorities={priorities}
            statuses={statuses}
            gridCls="grid grid-cols-1 gap-x-3 md:grid-cols-2"
          />
        )}
        {tab === "rooms" && <RoomsSection draft={draft} setDraft={setDraft} templates={templates} />}
        {tab === "subtasks" && <TasksSection draft={draft} setDraft={setDraft} employees={employees} />}
        {tab === "links" && <LinksSection draft={draft} setDraft={setDraft} />}

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
