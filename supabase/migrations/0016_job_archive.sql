-- Archive: jobs leave the board once every room is Complete (or an admin
-- archives them) and are listed on the /archive page instead.

alter table public.jobs add column if not exists archived boolean not null default false;
alter table public.jobs add column if not exists archived_at text not null default '';
