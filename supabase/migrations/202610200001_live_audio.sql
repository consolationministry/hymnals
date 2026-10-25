-- Web-only church audio broadcasts. Audio travels directly over WebRTC;
-- Supabase stores programme details/interactions and carries signaling events.

create table if not exists public.live_audio_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 120),
  description text not null default '' check (length(description) <= 2000),
  speaker text not null default '' check (length(speaker) <= 100),
  category text not null default 'Other' check (length(btrim(category)) between 1 and 48),
  image_url text not null default '',
  venue text not null default '' check (length(venue) <= 140),
  program_date date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_live boolean not null default false,
  live_session_id uuid,
  live_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint live_audio_session_state check (
    (is_live and live_session_id is not null) or
    (not is_live and live_session_id is null)
  )
);

create unique index if not exists live_audio_one_active_broadcast
  on public.live_audio_programs (is_live)
  where is_live;
create index if not exists live_audio_programs_public_order
  on public.live_audio_programs (status, program_date desc, updated_at desc);

create table if not exists public.live_audio_categories (
  name text primary key check (length(btrim(name)) between 1 and 48),
  created_at timestamptz not null default now()
);

insert into public.live_audio_categories (name)
values ('Bible Study'), ('Sunday Service'), ('Prayer Meeting'), ('Worship'), ('Youth Service'), ('Other')
on conflict (name) do nothing;

create table if not exists public.live_audio_comments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.live_audio_programs(id) on delete cascade,
  visitor_id uuid not null,
  body text not null check (length(btrim(body)) between 1 and 280),
  created_at timestamptz not null default now()
);
create index if not exists live_audio_comments_program_created
  on public.live_audio_comments (program_id, created_at desc);
create index if not exists live_audio_comments_visitor_created
  on public.live_audio_comments (visitor_id, created_at desc);

create table if not exists public.live_audio_reactions (
  program_id uuid not null references public.live_audio_programs(id) on delete cascade,
  visitor_id uuid not null,
  reaction text not null check (reaction in ('love', 'clap', 'fire')),
  created_at timestamptz not null default now(),
  primary key (program_id, visitor_id, reaction)
);

create table if not exists public.live_audio_listener_events (
  program_id uuid not null references public.live_audio_programs(id) on delete cascade,
  visitor_id uuid not null,
  session_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (program_id, session_id)
);
create index if not exists live_audio_listener_events_program
  on public.live_audio_listener_events (program_id, created_at desc);

alter table public.live_audio_programs enable row level security;
alter table public.live_audio_categories enable row level security;
alter table public.live_audio_comments enable row level security;
alter table public.live_audio_reactions enable row level security;
alter table public.live_audio_listener_events enable row level security;

drop policy if exists live_audio_programs_public_read on public.live_audio_programs;
create policy live_audio_programs_public_read on public.live_audio_programs
  for select to anon, authenticated using (status = 'published');
drop policy if exists live_audio_programs_admin_all on public.live_audio_programs;
create policy live_audio_programs_admin_all on public.live_audio_programs
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists live_audio_categories_public_read on public.live_audio_categories;
create policy live_audio_categories_public_read on public.live_audio_categories
  for select to anon, authenticated using (true);
drop policy if exists live_audio_categories_admin_all on public.live_audio_categories;
create policy live_audio_categories_admin_all on public.live_audio_categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.live_audio_programs, public.live_audio_categories,
  public.live_audio_comments, public.live_audio_reactions,
  public.live_audio_listener_events from public, anon, authenticated;
grant select on public.live_audio_programs, public.live_audio_categories to anon;
grant select on public.live_audio_programs, public.live_audio_categories to authenticated;
grant insert, update, delete on public.live_audio_programs, public.live_audio_categories to authenticated;

create or replace function public.get_live_audio_interactions(
  p_program_ids uuid[],
  p_visitor_id uuid
)
returns table (
  program_id uuid,
  love_count bigint,
  clap_count bigint,
  fire_count bigint,
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
  if p_program_id is null or p_visitor_id is null or p_reaction not in ('love', 'clap', 'fire') then
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
    select 1 from public.live_audio_programs
    where id = p_program_id and status = 'published'
  ) then
    raise exception 'This programme is not available for comments.';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_visitor_id::text)::bigint);
  if exists (
    select 1 from public.live_audio_comments
    where visitor_id = p_visitor_id and created_at > now() - interval '20 seconds'
  ) then
    raise exception 'Please wait 20 seconds before commenting again.';
  end if;

  return query
  insert into public.live_audio_comments (program_id, visitor_id, body)
  values (p_program_id, p_visitor_id, v_body)
  returning live_audio_comments.id, live_audio_comments.body, live_audio_comments.created_at;
end;
$$;

create or replace function public.record_live_audio_listen(
  p_program_id uuid,
  p_visitor_id uuid,
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_program_id is null or p_visitor_id is null or p_session_id is null then
    raise exception 'This listening session could not be identified.';
  end if;
  if not exists (
    select 1 from public.live_audio_programs
    where id = p_program_id and status = 'published' and is_live
  ) then
    raise exception 'This broadcast is no longer live.';
  end if;
  insert into public.live_audio_listener_events (program_id, visitor_id, session_id)
  values (p_program_id, p_visitor_id, p_session_id)
  on conflict (program_id, session_id) do nothing;
end;
$$;

create or replace function public.get_live_audio_admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;
  return jsonb_build_object(
    'total_broadcasts', (select count(*) from public.live_audio_programs),
    'total_listeners', (select count(*) from public.live_audio_listener_events),
    'total_likes', (select count(*) from public.live_audio_reactions),
    'total_comments', (select count(*) from public.live_audio_comments)
  );
end;
$$;

revoke all on function public.get_live_audio_interactions(uuid[], uuid) from public, anon, authenticated;
revoke all on function public.toggle_live_audio_reaction(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.submit_live_audio_comment(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.record_live_audio_listen(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.get_live_audio_admin_stats() from public, anon, authenticated;
grant execute on function public.get_live_audio_interactions(uuid[], uuid) to anon, authenticated;
grant execute on function public.toggle_live_audio_reaction(uuid, uuid, text) to anon, authenticated;
grant execute on function public.submit_live_audio_comment(uuid, uuid, text) to anon, authenticated;
grant execute on function public.record_live_audio_listen(uuid, uuid, uuid) to anon, authenticated;
grant execute on function public.get_live_audio_admin_stats() to authenticated;

comment on table public.live_audio_programs is
  'Published programme details for web-only, direct WebRTC church audio broadcasts.';
comment on table public.live_audio_comments is
  'Anonymous listener comments. Visitor IDs are unverified browser-generated identifiers.';
