"use client";

import { useEffect, useState } from "react";
import { BoardData, COLUMNS, Job } from "@/lib/types";
import { cloneDefaults, loadData, saveData } from "@/lib/storage";
import JobCard from "./JobCard";
import JobDialog from "./JobDialog";

function newJob(employees: string[]): Job {
  return {
    id: `job-${Date.now()}`,
    name: "",
    client: "",
    priority: "Normal",
    status: "Queued",
    lead: employees[0] ?? "",
    due: "",
    materials: "Waiting",
    notes: "",
    dropbox: "",
    handoff: "",
    subtasks: [],
  };
}

export default function Board() {
  const [data, setData] = useState<BoardData | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [shopTv, setShopTv] = useState(false);
  const [editing, setEditing] = useState<{ job: Job; isNew: boolean } | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  if (!data) return null;

  function update(next: BoardData) {
    setData(next);
    saveData(next);
  }

  function matches(j: Job) {
    const q = search.trim().toLowerCase();
    const subEmp = j.subtasks.some((s) => s.employee === employeeFilter);
    const text = [j.name, j.client, j.notes, j.lead, ...j.subtasks.map((s) => `${s.title} ${s.employee}`)]
      .join(" ")
      .toLowerCase();
    return (
      (!q || text.includes(q)) &&
      (!priorityFilter || j.priority === priorityFilter) &&
      (!jobFilter || j.name === jobFilter) &&
      (!employeeFilter || j.lead === employeeFilter || subEmp)
    );
  }

  function moveJob(id: string, delta: number) {
    if (!data) return;
    const jobs = data.jobs.map((j) => {
      if (j.id !== id) return j;
      const i = COLUMNS.indexOf(j.status);
      const ni = Math.max(0, Math.min(COLUMNS.length - 1, i + delta));
      return { ...j, status: COLUMNS[ni] };
    });
    update({ ...data, jobs });
  }

  function saveJob(job: Job, isNew: boolean) {
    if (!data) return;
    const jobs = isNew ? [...data.jobs, job] : data.jobs.map((j) => (j.id === job.id ? job : j));
    update({ ...data, jobs });
    setEditing(null);
  }

  function deleteJob(id: string) {
    if (!data) return;
    if (!confirm("Delete this job?")) return;
    update({ ...data, jobs: data.jobs.filter((j) => j.id !== id) });
    setEditing(null);
  }

  function resetData() {
    if (!confirm("Reset only this browser's preview data to the bundled defaults?")) return;
    update(cloneDefaults());
  }

  const jobNames = [...data.jobs.map((j) => j.name)].sort();

  return (
    <div>
      <header className={`flex items-center justify-between gap-3 border-b border-line bg-white px-[22px] py-[18px] ${shopTv ? "" : "sticky top-0 z-10"}`}>
        <div>
          <h1 className="text-[22px] font-bold tracking-wide">OGEE Millwork PMA</h1>
          <p className="mt-[3px] text-[13px] text-muted">Standalone local project manager</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-line bg-white px-[11px] py-2"
            onClick={() => setShopTv((v) => !v)}
          >
            {shopTv ? "Management Mode" : "Shop TV Mode"}
          </button>
          <button
            className="rounded-lg border border-accent bg-accent px-[11px] py-2 text-white"
            onClick={() => setEditing({ job: newJob(data.employees), isNew: true })}
          >
            + Add Job
          </button>
          <button className="rounded-lg border border-line bg-transparent px-[11px] py-2 text-danger" onClick={resetData}>
            Reset Preview Data
          </button>
        </div>
      </header>

      {!shopTv && (
        <section className="grid grid-cols-2 gap-2.5 p-[14px_18px] min-[901px]:grid-cols-[minmax(220px,1.8fr)_repeat(3,minmax(140px,1fr))]">
          <input
            type="search"
            className="w-full rounded-lg border border-line bg-white px-2.5 py-[9px]"
            placeholder="Search jobs, clients, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-line bg-white px-2.5 py-[9px]"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All priorities</option>
            {data.priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border border-line bg-white px-2.5 py-[9px]"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="">All jobs</option>
            {jobNames.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border border-line bg-white px-2.5 py-[9px]"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">All employees</option>
            {data.employees.map((emp) => (
              <option key={emp}>{emp}</option>
            ))}
          </select>
        </section>
      )}

      <main
        className={`grid items-start gap-3.5 overflow-auto px-[18px] pb-[22px] grid-cols-[repeat(2,minmax(260px,1fr))] ${
          shopTv
            ? "pt-[14px] text-[1.1rem] min-[901px]:grid-cols-[repeat(4,1fr)]"
            : "min-[901px]:grid-cols-[repeat(4,minmax(270px,1fr))]"
        }`}
      >
        {COLUMNS.map((status) => {
          const jobs = data.jobs.filter((j) => j.status === status && matches(j));
          return (
            <section key={status} className="min-h-[520px] rounded-xl border border-[#d1d0ca] bg-[#e8e7e2] p-2.5">
              <h2 className="mx-1 mb-2.5 mt-0.5 flex items-center justify-between text-sm font-bold">
                {status} <span className="font-medium text-muted">{jobs.length}</span>
              </h2>
              <div>
                {jobs.map((j) => (
                  <JobCard
                    key={j.id}
                    job={j}
                    shopTv={shopTv}
                    onOpen={() => setEditing({ job: j, isNew: false })}
                    onMove={(delta) => moveJob(j.id, delta)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {editing && (
        <JobDialog
          job={editing.job}
          isNew={editing.isNew}
          employees={data.employees}
          priorities={data.priorities}
          statuses={data.statuses}
          onSave={(job) => saveJob(job, editing.isNew)}
          onDelete={() => deleteJob(editing.job.id)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
