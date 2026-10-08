"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { Job, Priority, StateTemplate, Status } from "@/lib/types";
import { PRIORITY_COLORS, STATE_COLORS } from "./JobCard";
import { DetailsSection, LinksSection, RoomsSection, TasksSection, cleanJob } from "./JobSections";

function Column({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <h2 className="flex items-center justify-between border-b border-line bg-panel2 px-3.5 py-3 text-[14px] font-bold uppercase tracking-[.08em]">
        {title}
        {count !== undefined && <span className="min-w-[24px] text-center text-[12px] font-normal text-muted">{count}</span>}
      </h2>
      <div className="flex-1 overflow-y-auto p-3 min-[901px]:min-h-0">{children}</div>
    </section>
  );
}

// A job laid out like the board: one screen, four scrolling columns. Edits
// collect in a draft and are saved together, like the job dialog.
export default function JobPage({
  job,
  canEdit,
  clients,
  employees,
  priorities,
  statuses,
  templates,
  onSave,
  onDelete,
}: {
  job: Job | undefined;
  canEdit: boolean;
  clients: string[];
  employees: string[];
  priorities: Priority[];
  statuses: Status[];
  templates: StateTemplate[];
  onSave: (job: Job) => void;
  onDelete: () => void;
}) {
  // `base` is the version of the job the draft started from; while the two
  // match, the draft follows live updates to the job.
  const [base, setBase] = useState<Job | undefined>(job);
  const [draft, setDraft] = useState<Job | undefined>(job);
  const dirty = JSON.stringify(draft) !== JSON.stringify(base);

  useEffect(() => {
    if (!dirty) {
      setBase(job);
      setDraft(job);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!job || !draft) {
    return (
      <div className="p-[18px]">
        <p className="text-[15px]">Job not found.</p>
        <Link href="/" className="mt-2 inline-block font-bold text-[#8ec8ef] underline">
          ← Back to the board
        </Link>
      </div>
    );
  }

  const setJob = setDraft as React.Dispatch<React.SetStateAction<Job>>;

  function save() {
    if (!draft) return;
    const cleaned = cleanJob(draft);
    if (!cleaned.name) return;
    onSave(cleaned);
    setBase(cleaned);
    setDraft(cleaned);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-[18px] pt-[14px]">
        <Link
          href="/"
          className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 text-[14px] font-bold"
          onClick={(e) => {
            if (dirty && !confirm("Leave without saving your changes?")) e.preventDefault();
          }}
        >
          ← Board
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[22px] font-bold">{draft.name || "Untitled job"}</h2>
            <span
              className="shrink-0 rounded-full border border-current px-[6px] py-[3px] text-[10px] font-extrabold"
              style={{ color: PRIORITY_COLORS[draft.priority] }}
            >
              {draft.priority}
            </span>
          </div>
          {draft.client && <div className="text-[13px] text-muted">{draft.client}</div>}
        </div>
        <div className="flex flex-wrap gap-1">
          {draft.rooms.map((r) => (
            <span
              key={r.id}
              className="rounded-full border border-current px-[6px] py-[3px] text-[10px] font-extrabold"
              style={{ color: STATE_COLORS[r.state] }}
            >
              {r.name} · {r.state}
            </span>
          ))}
        </div>
        <span className="flex-1" />
        {canEdit && dirty && (
          <div className="flex items-center gap-2 rounded-xl border border-warn bg-panel px-3 py-1.5">
            <span className="text-[13px] font-bold text-[#f0c86c]">Unsaved changes</span>
            <button
              className="rounded-[10px] border border-line bg-panel2 px-[11px] py-1.5 text-[14px] font-bold"
              onClick={() => setDraft(base)}
            >
              Discard
            </button>
            <button
              className="rounded-[10px] border border-warn bg-accent px-[11px] py-1.5 text-[14px] font-bold text-[#17130c]"
              onClick={save}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <main className="grid grid-cols-1 gap-3.5 px-[18px] pb-[18px] pt-[14px] min-[901px]:min-h-0 min-[901px]:flex-1 min-[901px]:grid-cols-4 min-[901px]:grid-rows-[minmax(0,1fr)]">
        {/* display:contents keeps the grid while still disabling every control for read-only viewers */}
        <fieldset disabled={!canEdit} className="contents">
          <Column title="Rooms" count={draft.rooms.length}>
            <RoomsSection draft={draft} setDraft={setJob} templates={templates} />
          </Column>
          <Column title="Tasks" count={draft.subtasks.filter((s) => !s.done).length}>
            <TasksSection draft={draft} setDraft={setJob} employees={employees} />
          </Column>
          <Column title="Links">
            <LinksSection draft={draft} setDraft={setJob} />
          </Column>
          <Column title="Details">
            <DetailsSection
              draft={draft}
              setDraft={setJob}
              clients={clients}
              employees={employees}
              priorities={priorities}
              statuses={statuses}
            />
            {canEdit && (
              <button
                className="mt-1 rounded-[10px] border border-[#6d3232] bg-[#3b1d1d] px-[11px] py-2 font-bold text-[#ffb8b8]"
                onClick={onDelete}
              >
                Delete Job
              </button>
            )}
          </Column>
        </fieldset>
      </main>
    </>
  );
}
