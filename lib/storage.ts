import { OGEE_DEFAULTS } from "./defaults";
import { BoardData, Job, JobState, Room } from "./types";

// v10: dropped the demo seed jobs for the real project list — a new key so
// browsers holding the old demo data start fresh instead of resurrecting it.
const STORAGE_KEY = "ogee-pma-v10-local";

export function cloneDefaults(): BoardData {
  return JSON.parse(JSON.stringify(OGEE_DEFAULTS));
}

// Patch older saved data on load: the "Normal" priority rename, jobs that
// predate the pipeline state (including the short-lived multi-state list),
// subtasks that predate their own workflow status, and jobs that predate
// rooms — those get one "Main" room at the job's state holding every
// subtask that has no room yet.
type LegacyJob = Omit<Job, "rooms" | "state"> & { state?: string; states?: string[]; rooms?: Room[] };

export function normalizeJobs(jobs: LegacyJob[]): Job[] {
  // the "Punch" state was folded into "Adjustment"
  const fixState = (state?: string) => (state === "Punch" ? "Adjustment" : state) as JobState | undefined;
  return jobs.map((j) => {
    const state = fixState(j.state ?? j.states?.[0]) ?? "Discovery";
    const rooms: Room[] = j.rooms?.length ? j.rooms : [{ id: `${j.id}-main`, name: "Main", state }];
    const { states: _legacy, ...rest } = j;
    return {
      ...rest,
      priority: (j.priority as string) === "Normal" ? "Medium" : j.priority,
      state,
      rooms,
      subtasks: (j.subtasks ?? []).map((s) => ({
        ...s,
        status: s.status ?? (s.done ? "Complete" : "Queued"),
        state: fixState(s.state ?? j.state ?? j.states?.[0]) ?? "Discovery",
        roomId: s.roomId && rooms.some((r) => r.id === s.roomId) ? s.roomId : rooms[0].id,
      })),
    };
  });
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
    merged.templates = merged.templates ?? [];
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
