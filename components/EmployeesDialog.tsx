"use client";

import { useState } from "react";

const inputCls = "w-full rounded-lg border border-line bg-white px-2.5 py-[9px]";

export default function EmployeesDialog({
  employees,
  onAdd,
  onRemove,
  onClose,
}: {
  employees: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState("");

  function add() {
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-[480px] rounded-[14px] bg-white p-[18px] shadow-dialog" onMouseDown={(e) => e.stopPropagation()}>
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
            <div key={name} className="flex items-center justify-between gap-2 border-b border-[#eee] py-[9px]">
              <div className="truncate text-[14px] [font-weight:650]">{name}</div>
              <button
                className="rounded-lg border border-line bg-white px-[11px] py-[5px] text-xs"
                aria-label={`Remove ${name}`}
                onClick={() => onRemove(name)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
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
          <button className="rounded-lg border border-line bg-white px-[11px] py-2" onClick={add}>
            Add
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Removing a name doesn&apos;t change jobs it&apos;s already assigned to — it just leaves the pick lists.
        </p>
      </div>
    </div>
  );
}
