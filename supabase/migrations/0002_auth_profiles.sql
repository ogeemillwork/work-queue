-- Accounts with admin approval.
-- Every auth.users row gets a profiles row via trigger. New accounts start
-- unapproved; the admin email is auto-approved and flagged admin on sign-up.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  approved boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer so policies on jobs/profiles can check status without
-- recursive RLS lookups
create function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select approved from public.profiles where id = auth.uid()), false);
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin());

create policy "admins update profiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  admin_email constant text := 'jackqiu2016@gmail.com';
begin
  insert into public.profiles (id, email, approved, is_admin)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.email, '') = admin_email,
    coalesce(new.email, '') = admin_email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
