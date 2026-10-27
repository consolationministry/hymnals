-- Optional category badge for public programme feed cards.
alter table public.programs
  add column if not exists category text not null default '';

alter table public.programs
  drop constraint if exists programs_category_length_check;

alter table public.programs
  add constraint programs_category_length_check
  check (length(btrim(category)) <= 60);

grant select (category) on public.programs to anon;
