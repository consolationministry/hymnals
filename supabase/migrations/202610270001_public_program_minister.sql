-- Optional minister display for public programme posts.
alter table public.programs
  add column if not exists minister text not null default '';

grant select (minister) on public.programs to anon;
