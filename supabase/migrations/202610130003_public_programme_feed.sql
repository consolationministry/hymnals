-- Allow the public programme feed to order and label posts by creation time.
grant select (created_at) on public.programs to anon;

create index if not exists programs_created_at_desc
  on public.programs (created_at desc);
