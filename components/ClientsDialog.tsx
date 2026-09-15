"use client";

import { useState } from "react";

const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";

export default function ClientsDialog({
  clients,
  onAdd,
  onRemove,
  onClose,
}: {
  clients: string[];
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-[480px] rounded-[18px] border border-line bg-[#151c24] p-[18px] shadow-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Clients</h2>
            <div className="text-[13px] text-muted">Names available in the job dialog&apos;s client dropdown</div>
          </div>
          <button className="px-2 text-[25px] leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-4">
          {clients.length === 0 && <p className="text-[13px] text-muted">No clients yet — add one below.</p>}
          {[...clients].sort().map((name) => (
            <div key={name} className="flex items-center justify-between gap-2 border-b border-line py-[9px]">
              <div className="truncate text-[14px] [font-weight:650]">{name}</div>
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

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            className={inputCls}
            placeholder="New client name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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
          Typing a new client name on a job adds it here automatically. Removing a name doesn&apos;t change jobs that
          already use it.
        </p>
      </div>
    </div>
  );
}
