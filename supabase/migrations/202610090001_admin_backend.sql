-- Admin-only backend foundation for Consolation Hymnals.
-- Apply this migration in the Supabase SQL Editor. Do not add a service-role
-- key to the website, this repository, or a browser config file.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.categories (
  name text primary key check (length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists categories_name_case_insensitive
  on public.categories (lower(name));

insert into public.categories (name) values
  ('Praise'), ('Worship'), ('Thanksgiving'), ('Prayer'),
  ('Faith'), ('Hope'), ('Communion'), ('Evangelism')
on conflict (name) do nothing;

create table if not exists public.hymns (
  id uuid primary key default gen_random_uuid(),
  hymn_number integer not null unique check (hymn_number > 0),
  title_en text not null default '',
  title_yoruba text not null default '',
  first_line_en text not null default '',
  first_line_yoruba text not null default '',
  verses_en text[] not null default '{}',
  verses_yoruba text[] not null default '{}',
  chorus_en text not null default '',
  chorus_yoruba text not null default '',
  body_html_en text not null default '',
  body_html_yoruba text not null default '',
  chorus_html_en text not null default '',
  chorus_html_yoruba text not null default '',
  category text not null references public.categories(name) on update cascade on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists hymns_status_number on public.hymns (status, hymn_number);
create index if not exists hymns_updated_at on public.hymns (updated_at desc);

create table if not exists public.service_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 100),
  date date not null,
  hymn_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_plans_date on public.service_plans (date);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 120),
  venue text not null check (length(btrim(venue)) between 1 and 160),
  start_date date not null,
  end_date date,
  flyer_data_url text not null default '',
  response_question text not null check (length(btrim(response_question)) between 1 and 120),
  yes_label text not null check (length(btrim(yes_label)) between 1 and 48),
  no_label text not null check (length(btrim(no_label)) between 1 and 48),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programs_valid_date_range check (end_date is null or end_date >= start_date)
);

create index if not exists programs_start_date on public.programs (start_date);

create table if not exists public.admin_settings (
  id text primary key default 'global' check (id = 'global'),
  default_hymn_category text references public.categories(name) on update cascade on delete set null,
  default_theme text not null default 'system' check (default_theme in ('system', 'light', 'dark')),
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (id, default_hymn_category, default_theme)
values ('global', 'Praise', 'system')
on conflict (id) do nothing;

create table if not exists public.daily_quote_settings (
  id text primary key default 'global' check (id = 'global'),
  enabled boolean not null default true,
  books text[] not null default array['Psalms', 'Proverbs']::text[],
  refresh_mode text not null default 'on-open' check (refresh_mode in ('on-open', 'daily')),
  updated_at timestamptz not null default now(),
  constraint daily_quote_books_valid check (
    cardinality(books) > 0 and books <@ array['Psalms', 'Proverbs']::text[]
  )
);

insert into public.daily_quote_settings (id, enabled, books, refresh_mode)
values ('global', true, array['Psalms', 'Proverbs']::text[], 'on-open')
on conflict (id) do nothing;

create table if not exists public.backend_state (
  id text primary key default 'global' check (id = 'global'),
  initial_hymns_imported_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.backend_state (id) values ('global')
on conflict (id) do nothing;

create or replace function public.seed_hymns_if_empty(p_hymns jsonb)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  inserted_count integer := 0;
  source_count integer;
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access is required.';
  end if;

  if jsonb_typeof(p_hymns) <> 'array' then
    raise exception 'Hymn import must be a JSON array.';
  end if;

  if exists (
    select 1 from public.backend_state
    where id = 'global' and initial_hymns_imported_at is not null
  ) then
    return 0;
  end if;

  if exists (select 1 from public.hymns limit 1) then
    return 0;
  end if;

  select count(*) into source_count from jsonb_array_elements(p_hymns);
  if source_count = 0 then
    raise exception 'No source hymns were provided for import.';
  end if;

  insert into public.categories (name)
  select distinct btrim(source.category)
  from jsonb_to_recordset(p_hymns) as source(category text)
  where nullif(btrim(source.category), '') is not null
  on conflict (name) do nothing;

  insert into public.hymns (
    hymn_number, title_en, title_yoruba, first_line_en, first_line_yoruba,
    verses_en, verses_yoruba, chorus_en, chorus_yoruba,
    body_html_en, body_html_yoruba, chorus_html_en, chorus_html_yoruba,
    category, status, published_at
  )
  select
    source.hymn_number, coalesce(source.title_en, ''), coalesce(source.title_yoruba, ''),
    coalesce(source.first_line_en, ''), coalesce(source.first_line_yoruba, ''),
    coalesce(source.verses_en, '{}'::text[]), coalesce(source.verses_yoruba, '{}'::text[]),
    coalesce(source.chorus_en, ''), coalesce(source.chorus_yoruba, ''),
    coalesce(source.body_html_en, ''), coalesce(source.body_html_yoruba, ''),
    coalesce(source.chorus_html_en, ''), coalesce(source.chorus_html_yoruba, ''),
    btrim(source.category), 'published', now()
  from jsonb_to_recordset(p_hymns) as source(
    hymn_number integer, title_en text, title_yoruba text,
    first_line_en text, first_line_yoruba text,
    verses_en text[], verses_yoruba text[],
    chorus_en text, chorus_yoruba text,
    body_html_en text, body_html_yoruba text,
    chorus_html_en text, chorus_html_yoruba text,
    category text
  );

  get diagnostics inserted_count = row_count;
  update public.backend_state
  set initial_hymns_imported_at = now()
  where id = 'global';

  return inserted_count;
end;
$$;

revoke all on function public.seed_hymns_if_empty(jsonb) from public, anon;
grant execute on function public.seed_hymns_if_empty(jsonb) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists hymns_set_updated_at on public.hymns;
create trigger hymns_set_updated_at before update on public.hymns
for each row execute function public.set_updated_at();

drop trigger if exists service_plans_set_updated_at on public.service_plans;
create trigger service_plans_set_updated_at before update on public.service_plans
for each row execute function public.set_updated_at();

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists admin_settings_set_updated_at on public.admin_settings;
create trigger admin_settings_set_updated_at before update on public.admin_settings
for each row execute function public.set_updated_at();

drop trigger if exists daily_quote_settings_set_updated_at on public.daily_quote_settings;
create trigger daily_quote_settings_set_updated_at before update on public.daily_quote_settings
for each row execute function public.set_updated_at();

drop trigger if exists backend_state_set_updated_at on public.backend_state;
create trigger backend_state_set_updated_at before update on public.backend_state
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.hymns enable row level security;
alter table public.service_plans enable row level security;
alter table public.programs enable row level security;
alter table public.admin_settings enable row level security;
alter table public.daily_quote_settings enable row level security;
alter table public.backend_state enable row level security;

drop policy if exists admin_users_read_self on public.admin_users;
create policy admin_users_read_self on public.admin_users
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists hymns_admin_all on public.hymns;
create policy hymns_admin_all on public.hymns
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists service_plans_admin_all on public.service_plans;
create policy service_plans_admin_all on public.service_plans
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists programs_admin_all on public.programs;
create policy programs_admin_all on public.programs
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists admin_settings_admin_all on public.admin_settings;
create policy admin_settings_admin_all on public.admin_settings
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists daily_quote_settings_admin_all on public.daily_quote_settings;
create policy daily_quote_settings_admin_all on public.daily_quote_settings
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists backend_state_admin_all on public.backend_state;
create policy backend_state_admin_all on public.backend_state
for all to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

revoke all on public.admin_users, public.categories, public.hymns,
  public.service_plans, public.programs, public.admin_settings,
  public.daily_quote_settings, public.backend_state
from anon;

grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.categories, public.hymns,
  public.service_plans, public.programs, public.admin_settings,
  public.daily_quote_settings, public.backend_state
to authenticated;

-- Run from the Supabase SQL Editor after inviting/creating the admin account:
-- select public.grant_admin_by_email('your-admin-email@example.org');
-- The function is intentionally unavailable to browser roles.
create or replace function public.grant_admin_by_email(target_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if target_email is null or length(btrim(target_email)) = 0 then
    raise exception 'Provide the email address of an existing Auth user.';
  end if;

  select id into target_user_id
  from auth.users
  where lower(email) = lower(btrim(target_email))
    and email_confirmed_at is not null
  limit 1;

  if target_user_id is null then
    raise exception 'No confirmed Supabase Auth user was found for that email.';
  end if;

  insert into public.admin_users (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;

  return target_user_id;
end;
$$;

revoke all on function public.grant_admin_by_email(text) from public, anon, authenticated;
grant execute on function public.grant_admin_by_email(text) to service_role;
