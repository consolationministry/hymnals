-- Live audio engagement: thumbs-up like, live reaction bursts with an admin feed.

alter table public.live_audio_reactions drop constraint if exists live_audio_reactions_reaction_check;
alter table public.live_audio_reactions add constraint live_audio_reactions_reaction_check
  check (reaction in ('love', 'clap', 'fire', 'like'));

create or replace function public.toggle_live_audio_reaction(
  p_program_id uuid,
  p_visitor_id uuid,
  p_reaction text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_program_id is null or p_visitor_id is null or p_reaction not in ('love', 'clap', 'fire', 'like') then
    raise exception 'Choose a supported reaction.';
  end if;
  if not exists (
    select 1 from public.live_audio_programs
    where id = p_program_id and status = 'published'
  ) then
    raise exception 'This programme is not available for reactions.';
  end if;

  delete from public.live_audio_reactions
  where program_id = p_program_id and visitor_id = p_visitor_id and reaction = p_reaction;
  if found then
    return false;
  end if;

  insert into public.live_audio_reactions (program_id, visitor_id, reaction)
  values (p_program_id, p_visitor_id, p_reaction)
  on conflict (program_id, visitor_id, reaction) do nothing;
  return true;
end;
$$;

drop function if exists public.get_live_audio_interactions(uuid[], uuid);
create function public.get_live_audio_interactions(
  p_program_ids uuid[],
  p_visitor_id uuid
)
returns table (
  program_id uuid,
  love_count bigint,
  clap_count bigint,
  fire_count bigint,
  like_count bigint,
  my_reactions text[],
  comment_count bigint,
  listener_count bigint,
  comments jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    (select count(*) from public.live_audio_reactions r where r.program_id = p.id and r.reaction = 'love'),
    (select count(*) from public.live_audio_reactions r where r.program_id = p.id and r.reaction = 'clap'),
    (select count(*) from public.live_audio_reactions r where r.program_id = p.id and r.reaction = 'fire'),
    (select count(*) from public.live_audio_reactions r where r.program_id = p.id and r.reaction = 'like'),
    coalesce((
      select array_agg(r.reaction order by r.reaction)
      from public.live_audio_reactions r
      where r.program_id = p.id and r.visitor_id = p_visitor_id
    ), '{}'::text[]),
    (select count(*) from public.live_audio_comments c where c.program_id = p.id),
    (select count(*) from public.live_audio_listener_events l where l.program_id = p.id),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', recent.id,
        'body', recent.body,
        'created_at', recent.created_at
      ) order by recent.created_at)
      from (
        select c.id, c.body, c.created_at
        from public.live_audio_comments c
        where c.program_id = p.id
        order by c.created_at desc
        limit 12
      ) recent
    ), '[]'::jsonb)
  from public.live_audio_programs p
  where p.id = any(coalesce(p_program_ids, '{}'::uuid[]))
    and p.status = 'published';
$$;

create table if not exists public.live_audio_reaction_bursts (
  id bigint generated always as identity primary key,
  program_id uuid not null references public.live_audio_programs(id) on delete cascade,
  visitor_id uuid not null,
  reaction text not null check (reaction in ('love', 'clap', 'fire', 'like')),
  created_at timestamptz not null default now()
);
create index if not exists live_audio_reaction_bursts_program_id
  on public.live_audio_reaction_bursts (program_id, id);
alter table public.live_audio_reaction_bursts enable row level security;

create or replace function public.send_live_audio_burst(
  p_program_id uuid,
  p_visitor_id uuid,
  p_reaction text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_program_id is null or p_visitor_id is null or p_reaction not in ('love', 'clap', 'fire', 'like') then
    raise exception 'Choose a supported reaction.';
  end if;
  if not exists (
    select 1 from public.live_audio_programs
    where id = p_program_id and status = 'published' and is_live = true
  ) then
    raise exception 'Reactions are only sent while the programme is live.';
  end if;
  if (
    select count(*) from public.live_audio_reaction_bursts
    where visitor_id = p_visitor_id and created_at > now() - interval '10 seconds'
  ) >= 60 then
    raise exception 'Slow down a little.';
  end if;

  insert into public.live_audio_reaction_bursts (program_id, visitor_id, reaction)
  values (p_program_id, p_visitor_id, p_reaction);

  delete from public.live_audio_reaction_bursts
  where created_at < now() - interval '2 days';
end;
$$;

create or replace function public.get_live_audio_recent_bursts(
  p_program_id uuid,
  p_after_id bigint
)
returns table (id bigint, reaction text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;
  return query
  select b.id, b.reaction, b.created_at
  from public.live_audio_reaction_bursts b
  where b.program_id = p_program_id
    and b.id > coalesce(
      p_after_id,
      (select coalesce(max(x.id), 0) from public.live_audio_reaction_bursts x where x.program_id = p_program_id) - 50
    )
  order by b.id
  limit 200;
end;
$$;

revoke all on function public.toggle_live_audio_reaction(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.get_live_audio_interactions(uuid[], uuid) from public, anon, authenticated;
revoke all on function public.send_live_audio_burst(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.get_live_audio_recent_bursts(uuid, bigint) from public, anon, authenticated;
grant execute on function public.toggle_live_audio_reaction(uuid, uuid, text) to anon, authenticated;
grant execute on function public.get_live_audio_interactions(uuid[], uuid) to anon, authenticated;
grant execute on function public.send_live_audio_burst(uuid, uuid, text) to anon, authenticated;
grant execute on function public.get_live_audio_recent_bursts(uuid, bigint) to authenticated;
