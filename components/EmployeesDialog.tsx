"use client";

import { useState } from "react";

const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";

function EmailField({ name, email, onSetEmail }: { name: string; email: string; onSetEmail: (email: string) => void }) {
  const [value, setValue] = useState(email);

  function commit() {
    const next = value.trim();
    setValue(next);
    onSetEmail(next);
  }

  return (
    <input
      type="email"
      className="w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[5px] text-[13px] text-ink placeholder:text-muted"
      placeholder="Add email…"
      aria-label={`Email for ${name}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
    />
  );
}

export default function EmployeesDialog({
  employees,
  emails,
  onAdd,
  onSetEmail,
  onRemove,
  onClose,
}: {
  employees: string[];
  emails: Record<string, string>;
  onAdd: (name: string, email: string) => void;
  onSetEmail: (name: string, email: string) => void;
  onRemove: (name: string) => void;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function add() {
    const name = newName.trim();
    if (!name) return;
    onAdd(name, newEmail.trim());
    setNewName("");
    setNewEmail("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-[520px] rounded-[18px] border border-line bg-[#151c24] p-[18px] shadow-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Employees</h2>
            <div className="text-[13px] text-muted">Names available for leads, subtasks, and filters</div>
          </div>
          <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-4">
          {employees.length === 0 && <p className="text-[13px] text-muted">No employees yet — add one below.</p>}
          {employees.map((name) => (
            <div key={name} className="grid grid-cols-[110px_1fr_auto] items-center gap-2 border-b border-line py-[9px]">
              <div className="truncate text-[14px] [font-weight:650]">{name}</div>
              <EmailField key={`${name}-${emails[name] ?? ""}`} name={name} email={emails[name] ?? ""} onSetEmail={(email) => onSetEmail(name, email)} />
              <button
                className="rounded-[10px] border border-line bg-panel2 px-[11px] py-[5px] text-xs font-bold"
                aria-label={`Remove ${name}`}
                onClick={() => onRemove(name)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className={inputCls}
            placeholder="New employee name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <input
            type="email"
            className={inputCls}
            placeholder="Email (optional)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button className="rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold" onClick={add}>
            Add
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Emails save when you press Enter or click away. Removing a name doesn&apos;t change jobs it&apos;s already
          assigned to — it just leaves the pick lists.
        </p>
      </div>
    </div>
  );
}
