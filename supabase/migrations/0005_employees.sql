-- Editable employee list, shared like the jobs board.

create table public.employees (
  name text primary key,
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;

create policy "approved members access" on public.employees
  for all to authenticated
  using (public.is_approved())
  with check (public.is_approved());

insert into public.employees (name) values
  ('Jack'), ('Mike'), ('Alex'), ('Jose'), ('Sam'), ('Taylor')
on conflict (name) do nothing;
