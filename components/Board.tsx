"use client";

import { useEffect, useState } from "react";
import { BoardAuth, BoardData, COLUMNS, Job, Status } from "@/lib/types";
import { cloneDefaults, loadData, saveData } from "@/lib/storage";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import ApprovalsDialog from "./ApprovalsDialog";
import ClientsDialog from "./ClientsDialog";
import EmployeesDialog from "./EmployeesDialog";
import JobCard from "./JobCard";
import JobDialog from "./JobDialog";

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-w-[128px] rounded-[10px] border border-line bg-panel px-2.5 py-[7px] text-right">
      <div className="text-[16px] font-extrabold tracking-[.03em] tabular-nums">
        {now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "--:-- --"}
      </div>
      <div className="mt-0.5 text-[10px] text-muted">
        {now
          ? now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })
          : "---"}
      </div>
    </div>
  );
}

function newJob(employees: string[]): Job {
  return {
    id: `job-${Date.now()}`,
    name: "",
    client: "",
    clientPhone: "",
    clientEmail: "",
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
  const [showClients, setShowClients] = useState(false);
  const [dbClients, setDbClients] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dbEmails, setDbEmails] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewAsTeam, setViewAsTeam] = useState(false);
  const [expandedColumn, setExpandedColumn] = useState<Status | null>(null);
  const [editing, setEditing] = useState<{ job: Job; isNew: boolean } | null>(null);

  // What the UI treats as admin: a real admin can flip viewAsTeam on to
  // preview exactly what non-admins see.
  const showAdminUi = !!auth?.isAdmin && !viewAsTeam;

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
            const employeeEmails: Record<string, string> = {};
            try {
              const sb = getSupabaseBrowser();
              if (sb) {
                let emps = null;
                const withEmail = await sb.from("employees").select("name,email").order("created_at");
                if (withEmail.error) {
                  // employees.email column not migrated yet — fall back to names only
                  if (!cancelled) setDbEmails(false);
                  emps = (await sb.from("employees").select("name").order("created_at")).data as
                    | { name: string; email?: string }[]
                    | null;
                } else {
                  emps = withEmail.data;
                }
                if (emps) {
                  employees = emps.map((e) => e.name);
                  for (const e of emps) if (e.email) employeeEmails[e.name] = e.email;
                }
              }
            } catch {
              // keep the default list if the employees table is unreachable
            }
            let clients: string[] = Array.from(
              new Set((body.jobs as Job[]).map((j) => j.client).filter(Boolean))
            );
            try {
              const sb = getSupabaseBrowser();
              if (sb) {
                const res2 = await sb.from("clients").select("name").order("created_at");
                if (res2.error) {
                  // clients table not migrated yet — derive the list from jobs
                  if (!cancelled) setDbClients(false);
                } else if (res2.data) {
                  clients = Array.from(new Set([...res2.data.map((c) => c.name), ...clients]));
                }
              }
            } catch {
              // keep the derived list if the clients table is unreachable
            }
            if (!cancelled) {
              setDbMode(true);
              setData({ ...cloneDefaults(), employees, employeeEmails, clients, jobs: body.jobs });
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

  function moveJobTo(id: string, status: Status) {
    if (!data) return;
    let moved: Job | null = null;
    const jobs = data.jobs.map((j) => {
      if (j.id !== id || j.status === status) return j;
      moved = { ...j, status };
      return moved;
    });
    if (!moved) return;
    update({ ...data, jobs });
    persistJob(moved);
  }

  function saveJob(job: Job, isNew: boolean) {
    if (!data) return;
    const jobs = isNew ? [...data.jobs, job] : data.jobs.map((j) => (j.id === job.id ? job : j));
    // a newly typed client name joins the shared client list automatically
    const clients =
      job.client && !data.clients.includes(job.client) ? [...data.clients, job.client] : data.clients;
    if (clients !== data.clients && dbMode && dbClients) {
      getSupabaseBrowser()
        ?.from("clients")
        .insert({ name: job.client })
        .then(({ error }) => error && console.error(error));
    }
    update({ ...data, jobs, clients });
    persistJob(job);
    setEditing(null);
  }

  function addClient(name: string) {
    if (!data || data.clients.includes(name)) return;
    update({ ...data, clients: [...data.clients, name] });
    if (dbMode && dbClients) {
      getSupabaseBrowser()
        ?.from("clients")
        .insert({ name })
        .then(({ error }) => error && console.error(error));
    }
  }

  function removeClient(name: string) {
    if (!data) return;
    if (!confirm(`Remove ${name} from the client list?`)) return;
    update({ ...data, clients: data.clients.filter((c) => c !== name) });
    if (dbMode && dbClients) {
      getSupabaseBrowser()
        ?.from("clients")
        .delete()
        .eq("name", name)
        .then(({ error }) => error && console.error(error));
    }
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

  function addEmployee(name: string, email: string) {
    if (!data || data.employees.includes(name)) return;
    const employeeEmails = email ? { ...data.employeeEmails, [name]: email } : data.employeeEmails;
    update({ ...data, employees: [...data.employees, name], employeeEmails });
    if (dbMode) {
      getSupabaseBrowser()
        ?.from("employees")
        .insert(dbEmails ? { name, email: email || null } : { name })
        .then(({ error }) => error && console.error(error));
    }
  }

  function setEmployeeEmail(name: string, email: string) {
    if (!data || (data.employeeEmails[name] ?? "") === email) return;
    const employeeEmails = { ...data.employeeEmails };
    if (email) employeeEmails[name] = email;
    else delete employeeEmails[name];
    update({ ...data, employeeEmails });
    if (dbMode && dbEmails) {
      getSupabaseBrowser()
        ?.from("employees")
        .update({ email: email || null })
        .eq("name", name)
        .then(({ error }) => error && console.error(error));
    }
  }

  function removeEmployee(name: string) {
    if (!data) return;
    if (!confirm(`Remove ${name} from the employee list?`)) return;
    const employeeEmails = { ...data.employeeEmails };
    delete employeeEmails[name];
    update({ ...data, employees: data.employees.filter((e) => e !== name), employeeEmails });
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
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-[rgba(15,20,26,.98)] px-4 py-3">
        <div>
          <h1 className="text-[21px] font-bold tracking-[.08em]">OGEE MILLWORK</h1>
          <p className="mt-1 text-[12px] uppercase tracking-wide text-muted">
            {dbMode ? "Shared shop board" : "Shop production command board"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock />
          <div className="relative">
            <button
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-panel2 text-[15px] font-extrabold ${
                showAdminUi ? "border-accent text-accent" : "border-line text-ink"
              }`}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {(auth?.email?.[0] ?? "?").toUpperCase()}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div
                  role="menu"
                  className="absolute right-0 top-[46px] z-40 w-[260px] rounded-[14px] border border-line bg-[#151c24] p-2 shadow-dialog"
                >
                  <div className="border-b border-line px-2.5 pb-2.5 pt-1.5">
                    <div className="truncate text-[13px] font-bold">{auth ? auth.email : "Local preview"}</div>
                    <div
                      className={`mt-0.5 text-[10px] font-extrabold uppercase tracking-[.08em] ${
                        auth ? (showAdminUi ? "text-accent" : "text-muted") : "text-muted"
                      }`}
                    >
                      {auth ? (showAdminUi ? "Admin" : "Team member") : "Not signed in"}
                    </div>
                  </div>
                  {(showAdminUi || !auth) && (
                    <button
                      className="mt-1 w-full rounded-[10px] px-2.5 py-2 text-left text-[14px] font-bold text-accent hover:bg-panel2"
                      role="menuitem"
                      onClick={() => {
                        setEditing({ job: newJob(data.employees), isNew: true });
                        setMenuOpen(false);
                      }}
                    >
                      + Add Job
                    </button>
                  )}
                  <button
                    className="mt-1 w-full rounded-[10px] px-2.5 py-2 text-left text-[14px] font-bold hover:bg-panel2"
                    role="menuitem"
                    onClick={() => {
                      setShowEmployees(true);
                      setMenuOpen(false);
                    }}
                  >
                    Employees
                  </button>
                  <button
                    className="mt-1 w-full rounded-[10px] px-2.5 py-2 text-left text-[14px] font-bold hover:bg-panel2"
                    role="menuitem"
                    onClick={() => {
                      setShowClients(true);
                      setMenuOpen(false);
                    }}
                  >
                    Clients
                  </button>
                  {showAdminUi && auth && (
                    <button
                      className="mt-1 w-full rounded-[10px] px-2.5 py-2 text-left text-[14px] font-bold hover:bg-panel2"
                      role="menuitem"
                      onClick={() => {
                        setShowApprovals(true);
                        setMenuOpen(false);
                      }}
                    >
                      Approvals
                    </button>
                  )}
                  {auth?.isAdmin && (
                    <button
                      className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left text-[14px] font-bold hover:bg-panel2"
                      role="menuitemcheckbox"
                      aria-checked={viewAsTeam}
                      onClick={() => setViewAsTeam((v) => !v)}
                    >
                      View as team member
                      <span
                        className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
                          viewAsTeam ? "border-warn bg-accent" : "border-line bg-panel"
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] h-[14px] w-[14px] rounded-full transition-all ${
                            viewAsTeam ? "left-[18px] bg-[#17130c]" : "left-[2px] bg-muted"
                          }`}
                        />
                      </span>
                    </button>
                  )}
                  {auth && (
                    <button
                      className="mt-1 w-full rounded-[10px] border-t border-line px-2.5 pb-2 pt-2.5 text-left text-[14px] font-bold text-[#ffb8b8] hover:bg-panel2"
                      role="menuitem"
                      onClick={auth.signOut}
                    >
                      Sign out
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5 p-[14px_18px] pb-0 min-[901px]:grid-cols-[minmax(220px,1.8fr)_repeat(2,minmax(140px,1fr))]">
          <input
            type="search"
            className="w-full rounded-[10px] border border-line bg-panel px-2.5 py-[9px] text-ink"
            placeholder="Search jobs, clients, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full rounded-[10px] border border-line bg-panel px-2.5 py-[9px] text-ink"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All priorities</option>
            {data.priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            className="w-full rounded-[10px] border border-line bg-panel px-2.5 py-[9px] text-ink"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="">All jobs</option>
            {jobNames.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
      </section>

      <section className="flex flex-wrap gap-2.5 px-[18px] pt-[14px]">
          <button
            className={`rounded-xl border px-[18px] py-[10px] text-[1.05rem] font-bold ${
              employeeFilter === ""
                ? "border-warn bg-accent text-[#17130c]"
                : "border-line bg-panel2 text-ink"
            }`}
            onClick={() => setEmployeeFilter("")}
          >
            Everyone
          </button>
          {/* "user" is the shared break-room TV account, not a person — keep it out of the whose-tasks buttons */}
          {data.employees.filter((emp) => emp.toLowerCase() !== "user").map((emp) => (
            <button
              key={emp}
              className={`rounded-xl border px-[18px] py-[10px] text-[1.05rem] font-bold ${
                employeeFilter === emp
                  ? "border-warn bg-accent text-[#17130c]"
                  : "border-line bg-panel2 text-ink"
              }`}
              onClick={() => setEmployeeFilter((v) => (v === emp ? "" : emp))}
            >
              {emp}
            </button>
          ))}
        </section>

      <main
        className={`grid items-start gap-3.5 overflow-auto px-[18px] pb-[22px] pt-[14px] ${
          expandedColumn
            ? "grid-cols-1"
            : "grid-cols-[repeat(2,minmax(260px,1fr))] min-[901px]:grid-cols-[repeat(4,minmax(270px,1fr))]"
        }`}
      >
        {(expandedColumn ? [expandedColumn] : COLUMNS).map((status) => {
          const priorityRank = (j: Job) => {
            const i = data.priorities.indexOf(j.priority);
            return i === -1 ? data.priorities.length : i;
          };
          const jobs = data.jobs
            .filter((j) => j.status === status && matches(j))
            .sort((a, b) => priorityRank(a) - priorityRank(b));
          return (
            <section
              key={status}
              className="overflow-hidden rounded-2xl border border-line bg-panel"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) moveJobTo(id, status);
              }}
            >
              <h2
                className="flex cursor-pointer items-center justify-between border-b border-line bg-panel2 px-3.5 py-3 text-[14px] font-bold uppercase tracking-[.08em]"
                onClick={() => setExpandedColumn((c) => (c === status ? null : status))}
              >
                {status}
                <span className="min-w-[24px] text-center text-[12px] font-normal text-muted">
                  {expandedColumn === status ? `${jobs.length} · show all columns` : jobs.length}
                </span>
              </h2>
              <div
                className={
                  expandedColumn
                    ? "grid min-h-[480px] items-start gap-x-2.5 p-2.5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
                    : "min-h-[480px] p-2.5"
                }
              >
                {jobs.map((j) => (
                  <JobCard
                    key={j.id}
                    job={j}
                    selectedEmployee={employeeFilter}
                    onOpen={() => setEditing({ job: j, isNew: false })}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {showApprovals && auth && <ApprovalsDialog selfId={auth.userId} onClose={() => setShowApprovals(false)} />}

      {showClients && (
        <ClientsDialog clients={data.clients} onAdd={addClient} onRemove={removeClient} onClose={() => setShowClients(false)} />
      )}

      {showEmployees && (
        <EmployeesDialog
          employees={data.employees}
          emails={data.employeeEmails}
          onAdd={addEmployee}
          onSetEmail={setEmployeeEmail}
          onRemove={removeEmployee}
          onClose={() => setShowEmployees(false)}
        />
      )}

      {editing && (
        <JobDialog
          job={editing.job}
          isNew={editing.isNew}
          canEdit={showAdminUi || !auth}
          clients={data.clients}
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
