import { JOB_STATES, Job, JobState, PIPELINE, Room, StateTemplate, Subtask } from "./types";

// Rooms walk the pipeline on their own. A room leaves its current state once
// every subtask of that state is done; on entering a state it gets that
// state's template tasks, and states that end up with no work are skipped.

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function templatesFor(state: JobState, templates: StateTemplate[]): StateTemplate[] {
  return templates.filter((t) => t.state === state).sort((a, b) => a.sort - b.sort);
}

function tasksIn(subtasks: Subtask[], roomId: string, state: JobState): Subtask[] {
  return subtasks.filter((s) => s.roomId === roomId && (s.state ?? "Discovery") === state);
}

function nextState(state: JobState): JobState {
  return PIPELINE[PIPELINE.indexOf(state) + 1] ?? "Complete";
}

/** Subtasks to add when `room` enters `state`, skipping templates it already has open. */
export function instantiateTemplates(
  subtasks: Subtask[],
  roomId: string,
  state: JobState,
  templates: StateTemplate[]
): Subtask[] {
  const open = new Set(
    subtasks.filter((s) => s.roomId === roomId && !s.done && s.templateId).map((s) => s.templateId)
  );
  return templatesFor(state, templates)
    .filter((t) => !open.has(t.id))
    .map((t) => ({
      id: uid("st"),
      title: t.title,
      employee: t.employee,
      due: "",
      done: false,
      status: "Queued",
      state,
      roomId,
      templateId: t.id,
    }));
}

/** A fresh room at the start of the pipeline, with its Discovery templates. */
export function newRoom(name: string, templates: StateTemplate[]): { room: Room; subtasks: Subtask[] } {
  const room: Room = { id: uid("room"), name, state: PIPELINE[0] };
  return { room, subtasks: instantiateTemplates([], room.id, room.state, templates) };
}

/** Manually put a room in a state (the admin override). */
export function setRoomState(job: Job, roomId: string, state: JobState, templates: StateTemplate[]): Job {
  const room = job.rooms.find((r) => r.id === roomId);
  if (!room || room.state === state) return job;
  const moved: Room =
    state === "Adjustment"
      ? { ...room, state, returnState: room.state === "Adjustment" ? room.returnState : room.state }
      : { id: room.id, name: room.name, state };
  return {
    ...job,
    rooms: job.rooms.map((r) => (r.id === roomId ? moved : r)),
    subtasks: [...job.subtasks, ...instantiateTemplates(job.subtasks, roomId, state, templates)],
  };
}

function isFinished(tasks: Subtask[]): boolean {
  return tasks.length > 0 && tasks.every((s) => s.done);
}

/** Move every room whose current state's work is all done to its next state. */
export function advanceJob(job: Job, templates: StateTemplate[]): Job {
  let subtasks = job.subtasks;
  const rooms = job.rooms.map((original) => {
    let room = original;
    if (room.state === "Adjustment") {
      if (!isFinished(tasksIn(subtasks, room.id, "Adjustment"))) return room;
      room = { id: room.id, name: room.name, state: room.returnState ?? PIPELINE[0] };
    }
    if (room.state === "Complete" || !isFinished(tasksIn(subtasks, room.id, room.state))) return room;
    // Walk forward, adding each state's templates, until a state has open
    // work — states with none are skipped — or the room is Complete.
    let state: JobState = room.state;
    do {
      state = nextState(state);
      subtasks = [...subtasks, ...instantiateTemplates(subtasks, room.id, state, templates)];
    } while (state !== "Complete" && !tasksIn(subtasks, room.id, state).some((s) => !s.done));
    return { ...room, state };
  });
  return syncJobState({ ...job, rooms, subtasks });
}

function allComplete(job: Job | undefined): boolean {
  return !!job && job.rooms.length > 0 && job.rooms.every((r) => r.state === "Complete");
}

/**
 * Archive a job at the moment its last room reaches Complete. Comparing with
 * the previous version means a restored, already-finished job stays restored.
 */
export function autoArchive(previous: Job | undefined, next: Job): Job {
  if (next.archived || allComplete(previous) || !allComplete(next)) return next;
  return { ...next, archived: true, archivedAt: new Date().toISOString() };
}

/** Room states in pipeline order (Adjustment last), without repeats. */
export function roomStates(job: Job): JobState[] {
  if (!job.rooms?.length) return [job.state ?? "Discovery"];
  return JOB_STATES.filter((st) => job.rooms.some((r) => r.state === st));
}

/** Keep the job-level state (and its DB column) at the earliest room's state. */
export function syncJobState(job: Job): Job {
  const state = roomStates(job)[0];
  return state === job.state ? job : { ...job, state };
}
