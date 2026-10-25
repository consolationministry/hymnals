-- Keep Cloudinary credentials unavailable to browser roles. Only the
-- cloudinary-live-audio Edge Function uses the service role to read this row.
create table if not exists public.cloudinary_credentials (
  id text primary key default 'global' check (id = 'global'),
  cloud_name text not null,
  api_key text not null,
  api_secret text not null,
  updated_at timestamptz not null default now()
);

alter table public.cloudinary_credentials enable row level security;
revoke all on public.cloudinary_credentials from public, anon, authenticated;
grant all on public.cloudinary_credentials to service_role;

comment on table public.cloudinary_credentials is
  'Cloudinary API credentials for the server-side audio signing function. Browser roles must never read this table.';

-- New audio rows hold an authenticated Cloudinary public ID and its original
-- format. Existing Supabase Storage paths remain valid for old recordings.
alter table public.live_audio_segments
  drop constraint if exists live_audio_segment_path_matches_session,
  drop constraint if exists live_audio_segment_supported_extension;

alter table public.live_audio_segments
  add constraint live_audio_segment_path_matches_session check (
    storage_path =
      program_id::text || '/' || session_id::text || '/segments/' ||
      lpad(segment_index::text, 6, '0') || '.' ||
      split_part(storage_path, '.', 2)
    or storage_path ~ (
      '^cloudinary:video:authenticated:live-audio/' ||
      program_id::text || '/' || session_id::text ||
      '/segments/' || lpad(segment_index::text, 6, '0') ||
      ':(webm|ogg|m4a)$'
    )
  );

alter table public.live_audio_segments
  add constraint live_audio_segment_supported_extension check (
    storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/segments/[0-9]{6}\.(webm|ogg|m4a)$'
    or storage_path ~ '^cloudinary:video:authenticated:live-audio/[0-9a-f-]{36}/[0-9a-f-]{36}/segments/[0-9]{6}:(webm|ogg|m4a)$'
  );

comment on column public.live_audio_programs.recording_path is
  'Legacy Supabase object path or Cloudinary authenticated video public ID and format for a completed broadcast recording.';

comment on column public.live_audio_segments.storage_path is
  'Legacy Supabase object path or Cloudinary authenticated video public ID and format for a live rewind segment.';
