"use client";

import { useEffect, useState } from "react";
import { BoardAuth, BoardData, COLUMNS, Job, Status } from "@/lib/types";
import { cloneDefaults, loadData, saveData } from "@/lib/storage";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import ApprovalsDialog from "./ApprovalsDialog";
import EmployeesDialog from "./EmployeesDialog";
import JobCard from "./JobCard";
import JobDialog from "./JobDialog";

const COLUMN_ACCENT: Record<Status, string> = {
  Queued: "#8b9299",
  "In Progress": "#1f5f4a",
  Blocked: "#c93535",
  Install: "#e17826",
  Complete: "#4d78b8",
};

function Clock({ shopTv }: { shopTv: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  return (
    <div className="text-right leading-tight">
      <div className={`font-bold tabular-nums ${shopTv ? "text-[34px]" : "text-[22px]"}`}>
        {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </div>
      <div className={`text-white/70 ${shopTv ? "text-[15px]" : "text-[12px]"}`}>
        {now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}

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

export default function Board({ auth }: { auth: BoardAuth | null }) {
  const [data, setData] = useState<BoardData | null>(null);
  const [dbMode, setDbMode] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [shopTv, setShopTv] = useState(false);
  const [editing, setEditing] = useState<{ job: Job; isNew: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (auth) {
        try {
          const res = await fetch("/api/jobs", {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res.status === 401) {
            auth.signOut();
            return;
          }
          if (res.ok) {
            const body = await res.json();
            let employees = cloneDefaults().employees;
            try {
              const sb = getSupabaseBrowser();
              if (sb) {
                const { data: emps } = await sb.from("employees").select("name").order("created_at");
                if (emps) employees = emps.map((e) => e.name);
              }
            } catch {
              // keep the default list if the employees table is unreachable
            }
            if (!cancelled) {
              setDbMode(true);
              setData({ ...cloneDefaults(), employees, jobs: body.jobs });
            }
            return;
          }
        } catch {
          // fall through to localStorage
        }
      }
      if (!cancelled) setData(loadData());
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  if (!data) return null;

  function update(next: BoardData) {
    setData(next);
    if (!dbMode) saveData(next);
  }

  function authHeaders(): Record<string, string> {
    return auth ? { Authorization: `Bearer ${auth.token}` } : {};
  }

  function persistJob(job: Job) {
    if (!dbMode) return;
    fetch("/api/jobs", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(job),
    }).catch(console.error);
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
    let moved: Job | null = null;
    const jobs = data.jobs.map((j) => {
      if (j.id !== id) return j;
      const i = COLUMNS.indexOf(j.status);
      const ni = Math.max(0, Math.min(COLUMNS.length - 1, i + delta));
      moved = { ...j, status: COLUMNS[ni] };
      return moved;
    });
    update({ ...data, jobs });
    if (moved) persistJob(moved);
  }

  function saveJob(job: Job, isNew: boolean) {
    if (!data) return;
    const jobs = isNew ? [...data.jobs, job] : data.jobs.map((j) => (j.id === job.id ? job : j));
    update({ ...data, jobs });
    persistJob(job);
    setEditing(null);
  }

  function deleteJob(id: string) {
    if (!data) return;
    if (!confirm("Delete this job?")) return;
    update({ ...data, jobs: data.jobs.filter((j) => j.id !== id) });
    if (dbMode) {
      fetch(`/api/jobs?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() }).catch(
        console.error
      );
    }
    setEditing(null);
  }

  async function resetData() {
    if (dbMode) {
      if (!confirm("Reset the shared board to the bundled preview data for everyone?")) return;
      try {
        const res = await fetch("/api/jobs/reset", { method: "POST", headers: authHeaders() });
        if (res.ok) {
          const body = await res.json();
          setData((d) => (d ? { ...d, jobs: body.jobs } : d));
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }
    if (!confirm("Reset only this browser's preview data to the bundled defaults?")) return;
    update(cloneDefaults());
  }

  function addEmployee(name: string) {
    if (!data || data.employees.includes(name)) return;
    update({ ...data, employees: [...data.employees, name] });
    if (dbMode) {
      getSupabaseBrowser()
        ?.from("employees")
        .insert({ name })
        .then(({ error }) => error && console.error(error));
    }
  }

  function removeEmployee(name: string) {
    if (!data) return;
    if (!confirm(`Remove ${name} from the employee list?`)) return;
    update({ ...data, employees: data.employees.filter((e) => e !== name) });
    if (dbMode) {
      getSupabaseBrowser()
        ?.from("employees")
        .delete()
        .eq("name", name)
        .then(({ error }) => error && console.error(error));
    }
  }

  const jobNames = [...data.jobs.map((j) => j.name)].sort();

  return (
    <div>
      <header className={`flex items-center justify-between gap-3 border-b border-black/20 bg-accent px-[22px] py-[18px] text-white ${shopTv ? "" : "sticky top-0 z-10"}`}>
        <div>
          <h1 className="text-[22px] font-bold tracking-wide">OGEE Millwork PMA</h1>
          <p className="mt-[3px] text-[13px] text-white/70">
            {dbMode ? "Shared shop board" : "Standalone local project manager"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Clock shopTv={shopTv} />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              className="rounded-lg border border-white/30 bg-white/10 px-[11px] py-2 text-white"
              onClick={() => setShopTv((v) => !v)}
            >
              {shopTv ? "Management Mode" : "Shop TV Mode"}
            </button>
            <button
              className="rounded-lg border border-white bg-white px-[11px] py-2 font-semibold text-accent"
              onClick={() => setEditing({ job: newJob(data.employees), isNew: true })}
            >
              + Add Job
            </button>
            <button
              className="rounded-lg border border-white/30 bg-transparent px-[11px] py-2 text-[#ffd6d6]"
              onClick={resetData}
            >
              Reset Preview Data
            </button>
            <button
              className="rounded-lg border border-white/30 bg-white/10 px-[11px] py-2 text-white"
              onClick={() => setShowEmployees(true)}
            >
              Employees
            </button>
            {auth?.isAdmin && (
              <button
                className="rounded-lg border border-white/30 bg-white/10 px-[11px] py-2 text-white"
                onClick={() => setShowApprovals(true)}
              >
                Approvals
              </button>
            )}
            {auth && (
              <button
                className="rounded-lg border border-white/30 bg-white/10 px-[11px] py-2 text-white"
                onClick={auth.signOut}
              >
                Sign out
              </button>
            )}
          </div>
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
            <section
              key={status}
              className="min-h-[520px] rounded-xl border border-[#d1d0ca] border-t-4 bg-[#e8e7e2] p-2.5"
              style={{ borderTopColor: COLUMN_ACCENT[status] }}
            >
              <h2 className="mx-1 mb-2.5 mt-0.5 flex items-center justify-between text-sm font-bold">
                <span style={{ color: COLUMN_ACCENT[status] }}>{status}</span>{" "}
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: COLUMN_ACCENT[status] }}
                >
                  {jobs.length}
                </span>
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

      {showApprovals && auth && <ApprovalsDialog selfId={auth.userId} onClose={() => setShowApprovals(false)} />}

      {showEmployees && (
        <EmployeesDialog
          employees={data.employees}
          onAdd={addEmployee}
          onRemove={removeEmployee}
          onClose={() => setShowEmployees(false)}
        />
      )}

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
