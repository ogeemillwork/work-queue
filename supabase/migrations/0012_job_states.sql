-- Jobs can sit in several pipeline states at once (e.g. Installation /
-- Punch / Closeout), so `state` becomes a jsonb list `states`. The old
-- column stays for compatibility with older clients.

alter table public.jobs add column if not exists state text not null default 'Discovery';
alter table public.jobs add column if not exists states jsonb not null default '[]'::jsonb;

-- Existing single-state jobs become one-element lists.
update public.jobs
  set states = to_jsonb(array[state])
  where states = '[]'::jsonb;

-- The seeded real projects get their full status sets from the
-- 2026-09-15 Current Project List (no-ops for ids that aren't present).
update public.jobs set states = '["Engineering","Approval","Production"]'::jsonb where id = '156-liberty';
update public.jobs set states = '["Engineering","Pre-Production"]'::jsonb where id in ('62-highgate', '495-goodman', '1525-shotwell');
update public.jobs set states = '["Installation","Punch","Closeout"]'::jsonb where id = '3015-pacific';
update public.jobs set states = '["Installation","Finish Coordination","Punch"]'::jsonb where id = '20-conifer';
update public.jobs set states = '["Approval","Procurement","Production"]'::jsonb where id = 'cws-158-159';
update public.jobs set states = '["Procurement","Engineering"]'::jsonb where id = 'ehsan-doors';
update public.jobs set states = '["FAB","Final Dimensions"]'::jsonb where id = 'frances-howell';
update public.jobs set states = '["Punch","Closeout"]'::jsonb where id = '720-waller';
