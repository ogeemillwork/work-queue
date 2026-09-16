-- Pipeline state per job (Discovery … Adjustment), shown in admin mode.

alter table public.jobs
  add column if not exists state text not null default 'Discovery';

-- Give existing jobs a plausible starting state from their workflow status.
update public.jobs set state = case status
  when 'Queued' then 'Estimate'
  when 'In Progress' then 'Production'
  when 'Blocked' then 'Approval'
  when 'Install' then 'Shipping'
  when 'Complete' then 'Complete'
  else 'Discovery'
end
where state = 'Discovery';
