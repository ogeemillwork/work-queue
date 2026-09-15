export type Priority = "Urgent" | "High" | "Normal" | "Low";

export type Status = "Queued" | "In Progress" | "Blocked" | "Install" | "Complete";

export type Materials = "Ready" | "Partial" | "Waiting";

export interface Subtask {
  id: string;
  title: string;
  employee: string;
  due: string;
  done: boolean;
}

export interface Job {
  id: string;
  name: string;
  client: string;
  clientPhone?: string;
  clientEmail?: string;
  priority: Priority;
  status: Status;
  lead: string;
  due: string;
  materials: Materials;
  notes: string;
  dropbox: string;
  handoff: string;
  subtasks: Subtask[];
}

export interface BoardData {
  employees: string[];
  employeeEmails: Record<string, string>;
  clients: string[];
  priorities: Priority[];
  statuses: Status[];
  jobs: Job[];
}

export const COLUMNS: Status[] = ["Queued", "In Progress", "Blocked", "Install", "Complete"];

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

