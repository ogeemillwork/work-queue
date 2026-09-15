-- Editable client list, shared like the employee list, seeded from
-- the client names already on jobs.

create table public.clients (
  name text primary key,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "approved members access" on public.clients
  for all to authenticated
  using (public.is_approved())
  with check (public.is_approved());

insert into public.clients (name)
select distinct client from public.jobs where client <> ''
on conflict (name) do nothing;
