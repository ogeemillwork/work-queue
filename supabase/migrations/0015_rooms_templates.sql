-- Rooms: each job holds rooms that move through the pipeline on their own.
-- Stored as jsonb on the job like subtasks; the app gives jobs without rooms
-- a "Main" room on load.

alter table public.jobs add column if not exists rooms jsonb not null default '[]';

-- Template tasks per pipeline state, created for a room when it enters that
-- state. Every approved member reads them; only admins edit them.

create table if not exists public.state_templates (
  id text primary key,
  state text not null,
  title text not null,
  employee text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.state_templates enable row level security;

drop policy if exists "approved members read" on public.state_templates;
create policy "approved members read" on public.state_templates
  for select to authenticated
  using (public.is_approved());

drop policy if exists "admins write" on public.state_templates;
create policy "admins write" on public.state_templates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'state_templates'
  ) then
    alter publication supabase_realtime add table public.state_templates;
  end if;
end $$;
