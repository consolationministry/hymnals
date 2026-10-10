-- Keep the public display columns limited, but allow members to view
-- programs and service plans from any date, including past records.
revoke all on public.programs, public.service_plans from public, anon;

grant select (
  id,
  title,
  venue,
  start_date,
  end_date,
  flyer_data_url
) on public.programs to anon;

drop policy if exists programs_public_upcoming_read on public.programs;
drop policy if exists programs_public_read on public.programs;
create policy programs_public_read on public.programs
for select to anon
using (true);

grant select (
  id,
  title,
  date,
  hymn_ids
) on public.service_plans to anon;

drop policy if exists service_plans_public_upcoming_read on public.service_plans;
drop policy if exists service_plans_public_read on public.service_plans;
create policy service_plans_public_read on public.service_plans
for select to anon
using (true);
