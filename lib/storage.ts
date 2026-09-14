import { OGEE_DEFAULTS } from "./defaults";
import { BoardData } from "./types";

// Same key as the vanilla ogee-pma-local app, so existing browser data carries over.
const STORAGE_KEY = "ogee-pma-v9-local";

export function cloneDefaults(): BoardData {
  return JSON.parse(JSON.stringify(OGEE_DEFAULTS));
}

export function loadData(): BoardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.jobs)) return cloneDefaults();
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
