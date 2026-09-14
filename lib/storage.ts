import { OGEE_DEFAULTS } from "./defaults";
import { BoardData } from "./types";

// Bumped from v9 so browsers discard stale saved state and reseed from the bundled template jobs.
const STORAGE_KEY = "ogee-pma-v10-local";

export function cloneDefaults(): BoardData {
  return JSON.parse(JSON.stringify(OGEE_DEFAULTS));
}

export function loadData(): BoardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.jobs)) return cloneDefaults();
    // An empty board isn't useful in this preview app — repopulate it with the bundled jobs.
    if (parsed.jobs.length === 0) return { ...cloneDefaults(), ...parsed, jobs: cloneDefaults().jobs };
    return { ...cloneDefaults(), ...parsed };
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
