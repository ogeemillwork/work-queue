-- Optional contact email per employee, editable from the Employees dialog.

alter table public.employees
  add column if not exists email text;
