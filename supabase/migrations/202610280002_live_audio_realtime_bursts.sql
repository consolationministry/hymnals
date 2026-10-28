-- Live audio realtime: stream reaction bursts to listeners and the admin feed.

-- 1. Publish the burst table so Supabase Realtime can push INSERT events.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'live_audio_reaction_bursts'
  ) then
    alter publication supabase_realtime add table public.live_audio_reaction_bursts;
  end if;
end;
$$;

-- 2. Anonymous (listener) readers may only see bursts for programmes that are on air right now.
drop policy if exists "live audio bursts readable while live" on public.live_audio_reaction_bursts;
create policy "live audio bursts readable while live"
  on public.live_audio_reaction_bursts
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.live_audio_programs p
      where p.id = live_audio_reaction_bursts.program_id
        and p.status = 'published'
        and p.is_live = true
    )
  );

grant select on public.live_audio_reaction_bursts to anon, authenticated;
