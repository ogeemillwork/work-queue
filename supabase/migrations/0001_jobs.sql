-- Jobs table for the OGEE Millwork PMA shared board.
-- The app has no login: all access goes through the Next.js API routes,
-- which use the publishable (anon) key, so anon needs full access here.

create table public.jobs (
  id text primary key,
  name text not null,
  client text not null default '',
  priority text not null default 'Normal',
  status text not null default 'Queued',
  lead text not null default '',
  due text not null default '',
  materials text not null default 'Waiting',
  notes text not null default '',
  dropbox text not null default '',
  handoff text not null default '',
  subtasks jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "public board access" on public.jobs
  for all
  using (true)
  with check (true);
