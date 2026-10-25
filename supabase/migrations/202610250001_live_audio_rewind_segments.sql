-- Short, independently playable audio segments let public listeners rewind
-- within the active broadcast while the broadcaster continues streaming live.
create table if not exists public.live_audio_segments (
  program_id uuid not null references public.live_audio_programs(id) on delete cascade,
  session_id uuid not null,
  segment_index integer not null check (segment_index >= 0),
  started_at timestamptz not null,
  duration_seconds numeric(8, 3) not null check (duration_seconds > 0 and duration_seconds <= 60),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  primary key (program_id, session_id, segment_index),
  constraint live_audio_segment_path_matches_session check (
    storage_path = program_id::text || '/' || session_id::text || '/segments/' ||
      lpad(segment_index::text, 6, '0') || '.' ||
      split_part(storage_path, '.', 2)
  ),
  constraint live_audio_segment_supported_extension check (
    storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/segments/[0-9]{6}\.(webm|ogg|m4a)$'
  )
);

create index if not exists live_audio_segments_program_session_order
  on public.live_audio_segments (program_id, session_id, segment_index);

alter table public.live_audio_segments enable row level security;
revoke all on public.live_audio_segments from public, anon, authenticated;
grant select on public.live_audio_segments to anon, authenticated;
grant insert, delete on public.live_audio_segments to authenticated;

drop policy if exists live_audio_segments_public_active_read on public.live_audio_segments;
create policy live_audio_segments_public_active_read on public.live_audio_segments
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.live_audio_programs p
      where p.id = live_audio_segments.program_id
        and p.live_session_id = live_audio_segments.session_id
        and p.status = 'published'
        and p.is_live
    )
  );

drop policy if exists live_audio_segments_admin_insert on public.live_audio_segments;
create policy live_audio_segments_admin_insert on public.live_audio_segments
  for insert to authenticated
  with check (
    public.is_admin()
    and exists (
      select 1
      from public.live_audio_programs p
      where p.id = live_audio_segments.program_id
        and p.live_session_id = live_audio_segments.session_id
        and p.status = 'published'
        and p.is_live
    )
  );

drop policy if exists live_audio_segments_admin_delete on public.live_audio_segments;
create policy live_audio_segments_admin_delete on public.live_audio_segments
  for delete to authenticated
  using (public.is_admin());

drop policy if exists live_audio_recordings_published_read on storage.objects;
create policy live_audio_recordings_published_read on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'live-audio-recordings'
    and (
      exists (
        select 1
        from public.live_audio_programs p
        where p.recording_path = name
          and p.status = 'published'
      )
      or exists (
        select 1
        from public.live_audio_segments s
        join public.live_audio_programs p
          on p.id = s.program_id
          and p.live_session_id = s.session_id
        where s.storage_path = name
          and p.status = 'published'
          and p.is_live
      )
    )
  );
