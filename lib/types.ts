export type Priority = "Urgent" | "High" | "Medium" | "Low";

export type Status = "Queued" | "In Progress" | "Blocked" | "Install" | "Complete";

export type JobState =
  | "Discovery"
  | "Estimate"
  | "Design"
  | "Engineering"
  | "Approval"
  | "Procurement"
  | "Pre-Production"
  | "Final Dimensions"
  | "Production"
  | "FAB"
  | "Cut"
  | "Assembly"
  | "Shipping"
  | "Pack"
  | "Check Staging"
  | "Delivered"
  | "Installation"
  | "Finish Coordination"
  | "Closeout"
  | "Complete"
  | "Adjustment";

export const JOB_STATES: JobState[] = [
  "Discovery",
  "Estimate",
  "Design",
  "Engineering",
  "Approval",
  "Procurement",
  "Pre-Production",
  "Final Dimensions",
  "Production",
  "FAB",
  "Cut",
  "Assembly",
  "Shipping",
  "Pack",
  "Check Staging",
  "Delivered",
  "Installation",
  "Finish Coordination",
  "Closeout",
  "Complete",
  "Adjustment",
];

// Alphabetical listing for pick lists; JOB_STATES stays in pipeline order
// for sorting and the color key.
export const JOB_STATES_ALPHA: JobState[] = [...JOB_STATES].sort((a, b) => a.localeCompare(b));

// The linear room pipeline, Discovery → Complete. Adjustment sits outside
// it: an admin sends a room there by hand and it returns when done.
export const PIPELINE: JobState[] = JOB_STATES.filter((s) => s !== "Adjustment");

export type Materials = "Ready" | "Partial" | "Waiting";

export interface Subtask {
  id: string;
  title: string;
  employee: string;
  due: string;
  done: boolean;
  /** Workflow column on the work board; `done` mirrors status === "Complete". */
  status?: Status;
  /** Pipeline stage this piece of work belongs to. */
  state?: JobState;
  /** Room of the job this work is for. */
  roomId?: string;
  /** Set when the subtask was created from a state template. */
  templateId?: string;
}

/** A room of a job, moving through the pipeline on its own. */
export interface Room {
  id: string;
  name: string;
  state: JobState;
  /** While in Adjustment: the state to go back to once it is done. */
  returnState?: JobState;
}

/** A task created for a room whenever the room enters `state`. */
export interface StateTemplate {
  id: string;
  state: JobState;
  title: string;
  employee: string;
  sort: number;
}

export interface Job {
  id: string;
  name: string;
  client: string;
  clientPhone?: string;
  clientEmail?: string;
  priority: Priority;
  status: Status;
  /** Fallback pipeline state, shown only while a job has no open subtasks. */
  state?: JobState;
  lead: string;
  due: string;
  materials: Materials;
  notes: string;
  dropbox: string;
  handoff: string;
  rooms: Room[];
  subtasks: Subtask[];
}

export interface BoardData {
  employees: string[];
  employeeEmails: Record<string, string>;
  clients: string[];
  priorities: Priority[];
  statuses: Status[];
  templates: StateTemplate[];
  jobs: Job[];
}

// Work board order: Blocked is last because it renders as a full-width strip
// below the four workflow columns.
export const COLUMNS: Status[] = ["Queued", "In Progress", "Install", "Complete", "Blocked"];

export interface Profile {
  id: string;
  email: string;
  approved: boolean;
  is_admin: boolean;
  created_at?: string;
}

export interface BoardAuth {
  token: string;
  userId: string;
  email: string;
  isAdmin: boolean;
  signOut: () => void;
}

