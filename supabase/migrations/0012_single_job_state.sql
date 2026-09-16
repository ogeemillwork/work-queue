-- Jobs are in exactly one pipeline state. Drop the short-lived multi-state
-- column (a no-op if it was never added) and refine the seeded projects'
-- states now that the pipeline covers their real phases. Subtask workflow
-- statuses live inside the subtasks jsonb, so they need no schema change.

alter table public.jobs drop column if exists states;
alter table public.jobs add column if not exists state text not null default 'Discovery';

update public.jobs set state = 'Production' where id = '156-liberty';
update public.jobs set state = 'Pre-Production' where id = '62-highgate';
update public.jobs set state = 'Engineering' where id in ('495-goodman', '1525-shotwell');
update public.jobs set state = 'Punch' where id = '3015-pacific';
update public.jobs set state = 'Installation' where id = '20-conifer';
update public.jobs set state = 'Procurement' where id in ('cws-158-159', 'ehsan-doors');
update public.jobs set state = 'Final Dimensions' where id = 'frances-howell';
update public.jobs set state = 'Closeout' where id = '720-waller';

-- Starter subtasks from each project's stated next actions, only where
-- no subtasks have been entered yet.
update public.jobs set subtasks = '[{"id": "156-liberty-t1", "title": "Finalize remaining approval items", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Approval"}, {"id": "156-liberty-t2", "title": "Release approved areas to production", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Production"}]'::jsonb
  where id = '156-liberty' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "62-highgate-t1", "title": "Begin cutting kitchen casework", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Cut"}, {"id": "62-highgate-t2", "title": "Coordinate lighting/valance details", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Engineering"}]'::jsonb
  where id = '62-highgate' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "495-goodman-t1", "title": "Coordinate cabinet inserts, HVAC grilles and electrical", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Engineering"}, {"id": "495-goodman-t2", "title": "Finalize design details before release to production", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Design"}]'::jsonb
  where id = '495-goodman' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "3015-pacific-t1", "title": "Complete remaining installation items", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Installation"}, {"id": "3015-pacific-t2", "title": "Work the punch list", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Punch"}, {"id": "3015-pacific-t3", "title": "Closeout documentation", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Closeout"}]'::jsonb
  where id = '3015-pacific' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "20-conifer-t1", "title": "Install remaining millwork", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Installation"}, {"id": "20-conifer-t2", "title": "Coordinate finish work with Lara''s painting", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Finish Coordination"}, {"id": "20-conifer-t3", "title": "Install appliance garage after stone is complete", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Installation"}]'::jsonb
  where id = '20-conifer' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "cws-158-159-t1", "title": "Procure doors, glazing and hardware", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Procurement"}, {"id": "cws-158-159-t2", "title": "Begin door fabrication", "employee": "", "due": "", "done": false, "status": "Queued", "state": "FAB"}]'::jsonb
  where id = 'cws-158-159' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "1525-shotwell-t1", "title": "Finalize revised shop drawings", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Engineering"}, {"id": "1525-shotwell-t2", "title": "Confirm maple/calibrated plywood construction details", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Design"}]'::jsonb
  where id = '1525-shotwell' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "ehsan-doors-t1", "title": "Source specialty paint-grade pocket door", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Procurement"}, {"id": "ehsan-doors-t2", "title": "Add project address to PM file", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Discovery"}]'::jsonb
  where id = 'ehsan-doors' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "frances-howell-t1", "title": "Request final dimensions", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Final Dimensions"}, {"id": "frances-howell-t2", "title": "Fabricate white-oak countertop", "employee": "", "due": "", "done": false, "status": "Queued", "state": "FAB"}]'::jsonb
  where id = 'frances-howell' and subtasks = '[]'::jsonb;
update public.jobs set subtasks = '[{"id": "720-waller-t1", "title": "Confirm whether the job is still open", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Closeout"}]'::jsonb
  where id = '720-waller' and subtasks = '[]'::jsonb;
