-- Programme post descriptions and anonymous attendance responses.
-- Responses are private per-browser records; only totals and the current
-- browser's choice are returned through the narrowly scoped RPCs.

alter table public.programs
  add column if not exists description text not null default '';

create table if not exists public.programme_votes (
  program_id uuid not null references public.programs(id) on delete cascade,
  visitor_id uuid not null,
  choice text not null check (choice in ('yes', 'no')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (program_id, visitor_id)
);

create index if not exists programme_votes_program_choice
  on public.programme_votes (program_id, choice);

alter table public.programme_votes enable row level security;
revoke all on public.programme_votes from public, anon, authenticated;

-- The member feed needs the admin-configured prompt and button wording.
grant select (
  id,
  title,
  description,
  venue,
  start_date,
  end_date,
  flyer_data_url,
  created_at,
  response_question,
  yes_label,
  no_label
) on public.programs to anon;

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
        'vote_yes_count', summary.vote_yes_count,
        'vote_no_count', summary.vote_no_count,
        'my_vote', summary.my_vote,
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
        select count(*)
        from public.programme_votes as vote_yes
        where vote_yes.program_id = p.id and vote_yes.choice = 'yes'
      ) as vote_yes_count,
      (
        select count(*)
        from public.programme_votes as vote_no
        where vote_no.program_id = p.id and vote_no.choice = 'no'
      ) as vote_no_count,
      (
        select visitor_vote.choice
        from public.programme_votes as visitor_vote
        where visitor_vote.program_id = p.id
          and visitor_vote.visitor_id = p_visitor_id
        limit 1
      ) as my_vote,
      (
        select count(*)
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

create or replace function public.cast_programme_vote(
  p_program_id uuid,
  p_visitor_id uuid,
  p_choice text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_yes_count bigint;
  v_no_count bigint;
begin
  if p_program_id is null or p_visitor_id is null then
    raise exception 'A programme and browser ID are required.';
  end if;
  if p_choice not in ('yes', 'no') then
    raise exception 'Choose one of the programme response options.';
  end if;
  if not exists (select 1 from public.programs where id = p_program_id) then
    raise exception 'Programme not found.';
  end if;

  insert into public.programme_votes (program_id, visitor_id, choice)
  values (p_program_id, p_visitor_id, p_choice)
  on conflict (program_id, visitor_id)
  do update set choice = excluded.choice, updated_at = now();

  select
    count(*) filter (where choice = 'yes'),
    count(*) filter (where choice = 'no')
  into v_yes_count, v_no_count
  from public.programme_votes
  where program_id = p_program_id;

  return jsonb_build_object(
    'my_vote', p_choice,
    'vote_yes_count', v_yes_count,
    'vote_no_count', v_no_count
  );
end;
$$;

revoke all on function public.get_programme_interactions(uuid[], uuid) from public, anon, authenticated;
revoke all on function public.cast_programme_vote(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.get_programme_interactions(uuid[], uuid) to anon;
grant execute on function public.cast_programme_vote(uuid, uuid, text) to anon;

comment on table public.programme_votes is
  'Anonymous per-browser attendance responses on programme posts; one Yes/No choice per programme and browser ID.';
