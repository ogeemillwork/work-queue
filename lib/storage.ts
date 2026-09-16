import { OGEE_DEFAULTS } from "./defaults";
import { BoardData } from "./types";

// v10: dropped the demo seed jobs for the real project list — a new key so
// browsers holding the old demo data start fresh instead of resurrecting it.
const STORAGE_KEY = "ogee-pma-v10-local";

export function cloneDefaults(): BoardData {
  return JSON.parse(JSON.stringify(OGEE_DEFAULTS));
}

// Patch older saved data on load: the "Normal" priority rename, jobs that
// predate the pipeline state (including the short-lived multi-state list),
// and subtasks that predate their own workflow status.
export function normalizeJobs<
  T extends {
    priority: string;
    state?: string;
    states?: string[];
    subtasks: { done: boolean; status?: string; state?: string }[];
  },
>(jobs: T[]): T[] {
  // the "Punch" state was folded into "Adjustment"
  const fixState = (state?: string) => (state === "Punch" ? "Adjustment" : state);
  return jobs.map((j) => ({
    ...j,
    priority: j.priority === "Normal" ? "Medium" : j.priority,
    state: fixState(j.state ?? j.states?.[0]) ?? "Discovery",
    subtasks: (j.subtasks ?? []).map((s) => ({
      ...s,
      status: s.status ?? (s.done ? "Complete" : "Queued"),
      state: fixState(s.state ?? j.state ?? j.states?.[0]) ?? "Discovery",
    })),
  }));
}

export function loadData(): BoardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.jobs)) return cloneDefaults();
    const merged: BoardData = { ...cloneDefaults(), ...parsed };
    merged.jobs = normalizeJobs(merged.jobs);
    merged.priorities = cloneDefaults().priorities;
    // older saved data has no client list — build it from the jobs
    merged.clients = Array.from(
      new Set([...(merged.clients ?? []), ...merged.jobs.map((j) => j.client).filter(Boolean)])
    );
    return merged;
  } catch {
    return cloneDefaults();
  }
}

export function saveData(data: BoardData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable (private mode etc.) — app still works in memory
  }
}
