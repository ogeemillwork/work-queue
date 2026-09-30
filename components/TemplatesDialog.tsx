"use client";

import { useState } from "react";
import { JobState, PIPELINE, StateTemplate } from "@/lib/types";
import { templatesFor } from "@/lib/rooms";
import { STATE_COLORS } from "./JobCard";

const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";
const smallBtn = "rounded-[10px] border border-line bg-panel2 px-[11px] py-2 text-xs font-bold disabled:opacity-40";

// Every state a room can be in, in the order the wizard walks them.
const STEPS: JobState[] = [...PIPELINE, "Adjustment"];

// Admin wizard: step through the pipeline and list, for each state, the
// tasks a room gets when it enters that state.
export default function TemplatesDialog({
  templates,
  employees,
  onUpsert,
  onUpsertMany,
  onRemove,
  onClose,
  unsaved = false,
}: {
  templates: StateTemplate[];
  employees: string[];
  onUpsert: (t: StateTemplate) => void;
  onUpsertMany: (ts: StateTemplate[]) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  /** The database has no templates table yet, so edits last only for this visit. */
  unsaved?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newEmployee, setNewEmployee] = useState("");
  const state = STEPS[step];
  const current = templatesFor(state, templates);

  function add() {
    const title = newTitle.trim();
    if (!title) return;
    onUpsert({
      id: `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      state,
      title,
      employee: newEmployee,
      sort: current.length ? current[current.length - 1].sort + 1 : 0,
    });
    setNewTitle("");
  }

  // Swap a template with its neighbour, renumbering the state's list.
  function move(index: number, delta: number) {
    const order = [...current];
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    onUpsertMany(order.map((t, i) => ({ ...t, sort: i })));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-[760px] rounded-[18px] border border-line bg-[#151c24] p-[18px] shadow-dialog"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Task templates</h2>
            <div className="text-[13px] text-muted">
              Tasks each room gets automatically when it enters a state
            </div>
          </div>
          <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        {unsaved && (
          <p className="mt-3 rounded-[10px] border border-[#6d3232] bg-[#3b1d1d] px-3 py-2 text-[13px] text-[#ffb8b8]">
            Templates can&apos;t be saved yet: the database is missing the state_templates table (migration
            0015_rooms_templates.sql). Edits here won&apos;t be kept.
          </p>
        )}

        <nav aria-label="States" className="mt-4 flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => {
            const count = templatesFor(s, templates).length;
            return (
              <button
                key={s}
                className={`flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] font-extrabold ${
                  i === step ? "bg-panel2" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ color: STATE_COLORS[s], borderColor: i === step ? STATE_COLORS[s] : undefined }}
                onClick={() => setStep(i)}
              >
                {s}
                {count > 0 && <span className="text-[10px] text-muted">{count}</span>}
              </button>
            );
          })}
        </nav>

        <section className="mt-4 rounded-xl border border-line bg-panel p-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[.08em] text-muted">
            Step {step + 1} of {STEPS.length}
          </div>
          <h3 className="mt-0.5 text-xl font-bold" style={{ color: STATE_COLORS[state] }}>
            {state}
          </h3>
          <p className="mt-1 text-[13px] text-muted">
            {state === "Adjustment"
              ? "Created when an admin sends a room to Adjustment. Once they're done the room returns to where it was."
              : state === "Complete"
                ? "Created when a room finishes the pipeline."
                : "Created for a room when it enters this state. The room moves on once they're all done; states with no tasks are skipped."}
          </p>

          <div className="mt-3">
            {current.length === 0 && <p className="py-2 text-[13px] text-muted">No tasks for this state yet.</p>}
            {current.map((t, i) => (
              <div key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line py-2 md:grid-cols-[1fr_150px_auto]">
                <input
                  className={inputCls}
                  aria-label="Task title"
                  defaultValue={t.title}
                  onBlur={(e) => {
                    const title = e.target.value.trim();
                    if (title && title !== t.title) onUpsert({ ...t, title });
                  }}
                />
                <select
                  className={`${inputCls} col-start-1 md:col-auto`}
                  aria-label="Default assignee"
                  value={t.employee}
                  onChange={(e) => onUpsert({ ...t, employee: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp}>{emp}</option>
                  ))}
                </select>
                <div className="col-start-2 row-start-1 flex gap-1 md:col-auto md:row-auto">
                  <button className={smallBtn} aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button
                    className={smallBtn}
                    aria-label="Move down"
                    disabled={i === current.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                  <button className={smallBtn} aria-label={`Remove ${t.title}`} onClick={() => onRemove(t.id)}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 md:grid-cols-[1fr_150px_auto]">
            <input
              className={inputCls}
              placeholder={`New ${state} task`}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <select
              className={`${inputCls} col-start-1 md:col-auto`}
              aria-label="Default assignee for new task"
              value={newEmployee}
              onChange={(e) => setNewEmployee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp}>{emp}</option>
              ))}
            </select>
            <button className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold" onClick={add}>
              Add task
            </button>
          </div>
        </section>

        <div className="mt-[18px] flex gap-2 border-t border-line pt-3.5">
          <button
            className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold disabled:opacity-40"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
          <span className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button
              className="rounded-[10px] border border-warn bg-accent px-[11px] py-2 font-bold text-[#17130c]"
              onClick={() => setStep((s) => s + 1)}
            >
              Next: {STEPS[step + 1]} →
            </button>
          ) : (
            <button
              className="rounded-[10px] border border-warn bg-accent px-[11px] py-2 font-bold text-[#17130c]"
              onClick={onClose}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
