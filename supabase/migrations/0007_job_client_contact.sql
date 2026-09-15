-- Client contact details per job, editable from the job dialog.

alter table public.jobs
  add column if not exists client_phone text not null default '',
  add column if not exists client_email text not null default '';
