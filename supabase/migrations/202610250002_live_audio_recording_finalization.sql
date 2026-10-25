-- Keep completed recordings private while programmes are drafts, and allow the
-- admin to finish or safely retry an upload after the live session has ended.
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
    )
  );

drop policy if exists live_audio_recordings_admin_update on storage.objects;
create policy live_audio_recordings_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'live-audio-recordings'
    and public.is_admin()
    and exists (
      select 1
      from public.live_audio_programs p
      where p.id::text = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'live-audio-recordings'
    and public.is_admin()
    and exists (
      select 1
      from public.live_audio_programs p
      where p.id::text = (storage.foldername(name))[1]
    )
  );

-- Public reads remain limited to recordings linked to published programmes.
