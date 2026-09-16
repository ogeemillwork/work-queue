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

-- Subtasks exactly as the project list states them (remaining/underway
-- work only). Applied where no subtasks were entered by hand: empty, or
-- still carrying a previous auto-seeded set (ids like '<job>-t1').

update public.jobs set subtasks = '[]'::jsonb
  where id = '156-liberty' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "156-liberty-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "62-highgate-t1", "title": "Begin cutting", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Cut"}, {"id": "62-highgate-t2", "title": "Lighting/valance coordination", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Engineering"}]'::jsonb
  where id = '62-highgate' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "62-highgate-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "495-goodman-t1", "title": "Coordinate cabinet inserts, HVAC grilles, electrical and final design details", "employee": "", "due": "", "done": false, "status": "In Progress", "state": "Engineering"}]'::jsonb
  where id = '495-goodman' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "495-goodman-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "3015-pacific-t1", "title": "Installation", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Installation"}, {"id": "3015-pacific-t2", "title": "Punch", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Punch"}, {"id": "3015-pacific-t3", "title": "Closeout", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Closeout"}]'::jsonb
  where id = '3015-pacific' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "3015-pacific-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "20-conifer-t1", "title": "Installation", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Installation"}, {"id": "20-conifer-t2", "title": "Finish coordination", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Finish Coordination"}, {"id": "20-conifer-t3", "title": "Appliance garage \u2014 held until stone installation is complete", "employee": "", "due": "", "done": false, "status": "Blocked", "state": "Installation"}]'::jsonb
  where id = '20-conifer' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "20-conifer-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "cws-158-159-t1", "title": "Procurement", "employee": "", "due": "", "done": false, "status": "In Progress", "state": "Procurement"}, {"id": "cws-158-159-t2", "title": "Fabrication", "employee": "", "due": "", "done": false, "status": "Queued", "state": "FAB"}]'::jsonb
  where id = 'cws-158-159' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "cws-158-159-t1"}]'::jsonb);
update public.jobs set subtasks = '[]'::jsonb
  where id = '1525-shotwell' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "1525-shotwell-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "ehsan-doors-t1", "title": "Source/quote specialty paint-grade pocket door", "employee": "", "due": "", "done": false, "status": "In Progress", "state": "Procurement"}, {"id": "ehsan-doors-t2", "title": "Add project address to PM file", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Discovery"}]'::jsonb
  where id = 'ehsan-doors' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "ehsan-doors-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "frances-howell-t1", "title": "Request final dimensions before fabrication", "employee": "", "due": "", "done": false, "status": "In Progress", "state": "Final Dimensions"}]'::jsonb
  where id = 'frances-howell' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "frances-howell-t1"}]'::jsonb);
update public.jobs set subtasks = '[{"id": "720-waller-t1", "title": "Verify whether any fabrication, installation, punch or billing remains", "employee": "", "due": "", "done": false, "status": "Queued", "state": "Closeout"}]'::jsonb
  where id = '720-waller' and (subtasks = '[]'::jsonb or subtasks @> '[{"id": "720-waller-t1"}]'::jsonb);
