-- The "Normal" priority was renamed to "Medium".

update public.jobs set priority = 'Medium' where priority = 'Normal';
