-- Add andrew@ogeemillwork.com as a second auto-approved admin.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  admin_emails constant text[] := array['jackqiu2016@gmail.com', 'andrew@ogeemillwork.com'];
begin
  insert into public.profiles (id, email, approved, is_admin)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.email, '') = any(admin_emails),
    coalesce(new.email, '') = any(admin_emails)
  );
  return new;
end;
$$;

-- promote the account if it already signed up before this change
update public.profiles set approved = true, is_admin = true
where email = 'andrew@ogeemillwork.com';
