-- Allow administrators to select one member-facing hymn collection.
-- Draft/published status remains independent of collection activation.
begin;

alter table public.admin_settings
  add column if not exists active_hymnal text not null default 'cac';

update public.admin_settings
set active_hymnal = 'cac'
where active_hymnal is null or active_hymnal not in ('cac', 'uploaded');

alter table public.admin_settings
  drop constraint if exists admin_settings_active_hymnal_check;

alter table public.admin_settings
  add constraint admin_settings_active_hymnal_check
  check (active_hymnal in ('cac', 'uploaded'));

insert into public.admin_settings (id, active_hymnal)
values ('global', 'cac')
on conflict (id) do nothing;

create or replace function public.get_active_hymnal()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (select s.active_hymnal from public.admin_settings as s where s.id = 'global'),
    'cac'
  );
$$;

revoke all on function public.get_active_hymnal() from public;
grant execute on function public.get_active_hymnal() to anon, authenticated;

commit;
