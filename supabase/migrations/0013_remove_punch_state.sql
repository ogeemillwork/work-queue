-- The "Punch" pipeline state was removed; punch work lives under "Adjustment".

update public.jobs set state = 'Adjustment' where state = 'Punch';

update public.jobs
set subtasks = (
  select coalesce(
    jsonb_agg(
      case when s->>'state' = 'Punch' then jsonb_set(s, '{state}', '"Adjustment"') else s end
      order by ord
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(subtasks) with ordinality as t(s, ord)
)
where subtasks @> '[{"state": "Punch"}]'::jsonb;
