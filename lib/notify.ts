// Assignment emails for board saves, sent through Resend's API.
// Silently disabled until RESEND_API_KEY is configured.

type TaskLike = {
  id: string;
  title: string;
  employee: string;
  due?: string;
  state?: string;
};

// Accepts both the incoming Job payload and the snake_case database row —
// the fields the diff needs share their names between the two.
export type JobLike = {
  name: string;
  client?: string;
  priority: string;
  status: string;
  lead?: string;
  subtasks?: TaskLike[];
};

export interface JobEmail {
  to: string;
  subject: string;
  text: string;
}

const BOARD_URL = "https://workqueue.dev";

// Pure diff of a save against the previous row: which emails should go out?
// - a subtask assigned or reassigned to someone -> email that assignee
//   (all of their new assignments in this save collapse into one email)
// - status or priority changed on an existing job -> email the job's lead
export function jobUpdateEmails(
  before: JobLike | null,
  after: JobLike,
  emails: Record<string, string>
): JobEmail[] {
  const out: JobEmail[] = [];
  const addressOf = (name: string | undefined) =>
    name && name.toLowerCase() !== "user" ? emails[name] : undefined;
  const jobLabel = `${after.name}${after.client ? ` (${after.client})` : ""}`;

  const prevById = new Map((before?.subtasks ?? []).map((s) => [s.id, s]));
  const newAssignments = new Map<string, TaskLike[]>();
  for (const s of after.subtasks ?? []) {
    if (!s.employee) continue;
    if (prevById.get(s.id)?.employee === s.employee) continue;
    const list = newAssignments.get(s.employee) ?? [];
    list.push(s);
    newAssignments.set(s.employee, list);
  }
  newAssignments.forEach((tasks, name) => {
    const to = addressOf(name);
    if (!to) return;
    const lines = tasks.map(
      (s) => `- ${s.title}${s.state ? ` (${s.state})` : ""}${s.due ? ` — due ${s.due}` : ""}`
    );
    out.push({
      to,
      subject:
        tasks.length === 1
          ? `New assignment: ${tasks[0].title} — ${after.name}`
          : `${tasks.length} new assignments — ${after.name}`,
      text: `You've been assigned on ${jobLabel}:\n\n${lines.join("\n")}\n\nBoard: ${BOARD_URL}`,
    });
  });

  if (before) {
    const changes: string[] = [];
    if (before.status !== after.status) changes.push(`status: ${before.status} → ${after.status}`);
    if (before.priority !== after.priority)
      changes.push(`priority: ${before.priority} → ${after.priority}`);
    const to = addressOf(after.lead);
    if (changes.length && to) {
      out.push({
        to,
        subject: `${after.name}: ${changes.join(", ")}`,
        text: `${jobLabel} changed:\n\n${changes.map((c) => `- ${c}`).join("\n")}\n\nBoard: ${BOARD_URL}`,
      });
    }
  }

  return out;
}

// Fire the emails for a save. Never throws — a mail failure must not break
// the save that triggered it. Successes are logged too, so "did it send?"
// is answerable from the function logs.
export async function sendJobUpdateEmails(
  before: JobLike | null,
  after: JobLike,
  emails: Record<string, string>
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.NOTIFY_FROM_EMAIL ?? "OGEE Board <onboarding@resend.dev>";
  for (const email of jobUpdateEmails(before, after, emails)) {
    try {
      let res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ from, to: email.to, subject: email.subject, text: email.text }),
      });
      if (res.status === 429) {
        // Resend's free tier allows 2 requests/second — wait and retry once.
        await new Promise((r) => setTimeout(r, 700));
        res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({ from, to: email.to, subject: email.subject, text: email.text }),
        });
      }
      if (res.ok) console.log("notify: sent", email.to, "-", email.subject);
      else console.error("notify: resend error", res.status, await res.text(), "-", email.to);
    } catch (err) {
      console.error("notify: send failed", err, "-", email.to);
    }
  }
}
