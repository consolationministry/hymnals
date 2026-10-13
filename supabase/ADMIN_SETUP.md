# Supabase setup for the web admin

This repository keeps the member hymnal static and offline-capable. The admin page uses Supabase Auth and an admin-only database; it does not use a service-role key.

## One-time setup

1. In Supabase, rotate/revoke any secret or service-role keys that have been exposed. Never place those keys in this repository or the browser.
2. Open the project's SQL Editor and run `migrations/202610090001_admin_backend.sql`.
3. Back up the database, then run `migrations/202610130001_current_cac_ghb_catalog.sql` and `migrations/202610130002_current_cac_yhb_catalog.sql` to keep the selected 152 English and 152 Yorùbá CAC records. These migrations permanently delete other rows from those two CAC collections; they do not delete other-source hymns. The Yorùbá selection follows the current English catalog's printed hymn numbers, not a verified translation mapping. Saved service plans that reference deleted hymn rows may need their hymn selections updated.
4. To display programs and service plans from any date in the member web and Android apps, run `migrations/202610090003_public_programs_and_service_plans.sql` and then `migrations/202610110001_public_program_history.sql`. These migrations grant anonymous read access only to the fields used for display; the latest migration permits past and future dates. Admin writes remain authenticated.
5. In Authentication, invite or create the administrator account. Require email confirmation.
6. In the SQL Editor, grant the confirmed account admin access:

   ```sql
   select public.grant_admin_by_email('your-admin-email@example.org');
   ```

   Replace the example with the approved admin email. The email is intentionally not stored in this public repository.
7. Open the admin URL and sign in. The admin safely fills any missing hymns from the current repository catalog; newly added rows start as drafts, and existing rows and publication statuses are preserved for retained hymns.

The browser uses only the Supabase project URL and a publishable key. Row-level security denies unauthenticated access and checks the `admin_users` table for every admin-data operation. Do not disable RLS or add a service-role/secret key to client-side files.

## Existing data and scope

The catalog sync preserves retained database rows and inserts only missing current hymn numbers, in batches; it does not delete obsolete rows by itself. Run both dedicated catalog migrations above to remove records outside the selected indexes. Admin lists page through the complete collection instead of relying on the backend's first response page. Newly added entries are drafts; drafts are not returned to the member app. Published hymns remain available publicly until an administrator explicitly moves them to Drafts. The public web and Android apps request only hymns marked `published`; until public read access is configured, they safely use the last successful published list cached on that device.

Service plans and programs are writable only by authenticated administrators. The member app can display records from any date using only the whitelisted display fields in the public-content migrations. Admin preferences remain private, and attendance responses are not collected.
