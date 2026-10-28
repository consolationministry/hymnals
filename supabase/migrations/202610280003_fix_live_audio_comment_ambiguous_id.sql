-- Fix: "column reference \"id\" is ambiguous" when submitting live audio comments.
-- The RETURNS TABLE (id, body, created_at) output variables clash with unqualified
-- id/created_at references inside the function body. Every reference is now qualified.

create or replace function public.submit_live_audio_comment(
  p_program_id uuid,
  p_visitor_id uuid,
  p_body text
)
returns table (id uuid, body text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
begin
  if p_program_id is null or p_visitor_id is null then
    raise exception 'This programme could not be identified. Refresh and try again.';
  end if;
  if length(v_body) < 1 or length(v_body) > 280 then
    raise exception 'Comments must contain 1 to 280 characters.';
  end if;
  if not exists (
    select 1 from public.live_audio_programs p
    where p.id = p_program_id and p.status = 'published'
  ) then
    raise exception 'This programme is not available for comments.';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_visitor_id::text)::bigint);
  if exists (
    select 1 from public.live_audio_comments c
    where c.visitor_id = p_visitor_id and c.created_at > now() - interval '20 seconds'
  ) then
    raise exception 'Please wait 20 seconds before commenting again.';
  end if;

  return query
  insert into public.live_audio_comments (program_id, visitor_id, body)
  values (p_program_id, p_visitor_id, v_body)
  returning live_audio_comments.id, live_audio_comments.body, live_audio_comments.created_at;
end;
$$;

revoke all on function public.submit_live_audio_comment(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.submit_live_audio_comment(uuid, uuid, text) to anon, authenticated;
