-- Public member views are read-only. Only upcoming rows and display fields
-- are available without administrator authentication.
grant select (
  id,
  title,
  venue,
  start_date,
  end_date,
  flyer_data_url
) on public.programs to anon;

drop policy if exists programs_public_upcoming_read on public.programs;
create policy programs_public_upcoming_read on public.programs
for select to anon
using (coalesce(end_date, start_date) >= current_date);

grant select (
  id,
  title,
  date,
  hymn_ids
) on public.service_plans to anon;

drop policy if exists service_plans_public_upcoming_read on public.service_plans;
create policy service_plans_public_upcoming_read on public.service_plans
for select to anon
using (date >= current_date);
