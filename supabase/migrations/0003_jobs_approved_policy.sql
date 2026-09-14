-- Lock the board down to approved accounts.

drop policy "public board access" on public.jobs;

create policy "approved members access" on public.jobs
  for all to authenticated
  using (public.is_approved())
  with check (public.is_approved());
