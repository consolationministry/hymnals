-- Anonymous programme-post likes and comments.
-- Visitor IDs are random per-browser UUIDs used only for best-effort duplicate
-- control. They are never returned to the public client.

create table if not exists public.programme_likes (
  program_id uuid not null references public.programs(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (program_id, visitor_id)
);

create table if not exists public.programme_comments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  visitor_id uuid not null,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists programme_comments_program_created
  on public.programme_comments (program_id, created_at desc);
create index if not exists programme_comments_visitor_created
  on public.programme_comments (visitor_id, created_at desc);

alter table public.programme_likes enable row level security;
alter table public.programme_comments enable row level security;
revoke all on public.programme_likes, public.programme_comments from public, anon, authenticated;

create or replace function public.get_programme_interactions(
  p_program_ids uuid[],
  p_visitor_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'program_id', summary.program_id,
        'like_count', summary.like_count,
        'liked', summary.liked,
        'comment_count', summary.comment_count,
        'comments', summary.comments
      )
      order by summary.program_id
    ),
    '[]'::jsonb
  )
  from (
    select
      p.id as program_id,
      count(l.program_id)::bigint as like_count,
      coalesce(bool_or(l.visitor_id = p_visitor_id), false) as liked,
      (
        select count(*)::bigint
        from public.programme_comments as comment_count_row
        where comment_count_row.program_id = p.id
      ) as comment_count,
      (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', recent.id,
              'body', recent.body,
              'created_at', recent.created_at
            )
            order by recent.created_at desc
          ),
          '[]'::jsonb
        )
        from (
          select c.id, c.body, c.created_at
          from public.programme_comments as c
          where c.program_id = p.id
          order by c.created_at desc
          limit 50
        ) as recent
      ) as comments
    from public.programs as p
    left join public.programme_likes as l on l.program_id = p.id
    where p.id = any(coalesce(p_program_ids, '{}'::uuid[]))
    group by p.id
  ) as summary;
$$;

create or replace function public.toggle_programme_like(
  p_program_id uuid,
  p_visitor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_liked boolean;
  v_like_count bigint;
begin
  if p_program_id is null or p_visitor_id is null then
    raise exception 'A programme and browser ID are required.';
  end if;
  if not exists (select 1 from public.programs where id = p_program_id) then
    raise exception 'Programme not found.';
  end if;

  delete from public.programme_likes
  where program_id = p_program_id and visitor_id = p_visitor_id;
  if found then
    v_liked := false;
  else
    insert into public.programme_likes (program_id, visitor_id)
    values (p_program_id, p_visitor_id)
    on conflict (program_id, visitor_id) do nothing;
    v_liked := true;
  end if;

  select count(*)::bigint into v_like_count
  from public.programme_likes
  where program_id = p_program_id;

  return jsonb_build_object('liked', v_liked, 'like_count', v_like_count);
end;
$$;

create or replace function public.submit_programme_comment(
  p_program_id uuid,
  p_visitor_id uuid,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_comment_id uuid;
  v_created_at timestamptz;
begin
  if p_program_id is null or p_visitor_id is null then
    raise exception 'A programme and browser ID are required.';
  end if;
  if not exists (select 1 from public.programs where id = p_program_id) then
    raise exception 'Programme not found.';
  end if;
  if char_length(v_body) not between 1 and 500 then
    raise exception 'Comments must contain 1 to 500 characters.';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_visitor_id::text)::bigint);
  if exists (
    select 1
    from public.programme_comments
    where visitor_id = p_visitor_id
      and created_at > clock_timestamp() - interval '20 seconds'
  ) then
    raise exception 'Please wait 20 seconds before commenting again.';
  end if;

  insert into public.programme_comments (program_id, visitor_id, body)
  values (p_program_id, p_visitor_id, v_body)
  returning id, created_at into v_comment_id, v_created_at;

  return jsonb_build_object(
    'id', v_comment_id,
    'body', v_body,
    'created_at', v_created_at
  );
end;
$$;

revoke all on function public.get_programme_interactions(uuid[], uuid) from public, anon, authenticated;
revoke all on function public.toggle_programme_like(uuid, uuid) from public, anon, authenticated;
revoke all on function public.submit_programme_comment(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.get_programme_interactions(uuid[], uuid) to anon;
grant execute on function public.toggle_programme_like(uuid, uuid) to anon;
grant execute on function public.submit_programme_comment(uuid, uuid, text) to anon;

comment on table public.programme_comments is
  'Public anonymous comments on programme posts; comments are visible immediately and contain no author name.';
