-- Store completed live audio privately until an administrator publishes it.
alter table public.live_audio_programs
  add column if not exists recording_path text,
  add column if not exists recording_duration_seconds integer not null default 0
    check (recording_duration_seconds >= 0);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'live-audio-recordings',
  'live-audio-recordings',
  false,
  524288000,
  array['audio/webm', 'audio/ogg', 'audio/mp4']
)
on conflict (id) do update
set name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists live_audio_recordings_admin_upload on storage.objects;
create policy live_audio_recordings_admin_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'live-audio-recordings'
    and public.is_admin()
    and exists (
      select 1
      from public.live_audio_programs p
      where p.id::text = (storage.foldername(name))[1]
        and p.is_live
        and p.status = 'published'
    )
  );

drop policy if exists live_audio_recordings_admin_delete on storage.objects;
create policy live_audio_recordings_admin_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'live-audio-recordings'
    and public.is_admin()
  );

drop policy if exists live_audio_recordings_published_read on storage.objects;
create policy live_audio_recordings_published_read on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'live-audio-recordings'
    and exists (
      select 1
      from public.live_audio_programs p
      where p.recording_path = name
        and p.status = 'published'
    )
  );

comment on column public.live_audio_programs.recording_path is
  'Private Supabase Storage object path for a completed broadcast recording.';
comment on column public.live_audio_programs.recording_duration_seconds is
  'Duration of the completed broadcast recording in seconds.';
