# Supabase setup for the web admin

This repository keeps the member hymnal static and offline-capable. The admin page uses Supabase Auth and an admin-only database; it does not use a service-role key.

## One-time setup

1. In Supabase, rotate/revoke any secret or service-role keys that have been exposed. Never place those keys in this repository or the browser.
2. Open the project's SQL Editor and run `migrations/202610090001_admin_backend.sql`.
3. To display programs and service plans from any date in the member web and Android apps, run `migrations/202610090003_public_programs_and_service_plans.sql` and then `migrations/202610110001_public_program_history.sql` in the same Supabase project. These migrations grant anonymous read access only to the fields used for display; the latest migration permits past and future dates. Admin writes remain authenticated.
4. In Authentication, invite or create the administrator account. Require email confirmation.
5. In the SQL Editor, grant the confirmed account admin access:

   ```sql
   select public.grant_admin_by_email('your-admin-email@example.org');
   ```

   Replace the example with the approved admin email. The email is intentionally not stored in this public repository.
6. Open the admin URL and sign in. The admin safely fills any missing hymns from the repository catalog; newly added rows start as drafts, and existing rows and publication statuses are preserved.

The browser uses only the Supabase project URL and a publishable key. Row-level security denies unauthenticated access and checks the `admin_users` table for every admin-data operation. Do not disable RLS or add a service-role/secret key to client-side files.

## Existing data and scope

The catalog sync preserves existing database rows and inserts only missing hymn numbers, in batches. Admin lists page through the complete collection instead of relying on the backend's first response page. Newly added entries are drafts; drafts are not returned to the member app. Published hymns remain available publicly until an administrator explicitly moves them to Drafts. The public web and Android apps request only hymns marked `published`; until public read access is configured, they safely use the bundled collection or the last successful published list cached on that device.

Service plans and programs are writable only by authenticated administrators. The member app can display records from any date using only the whitelisted display fields in the public-content migrations. Admin preferences remain private, and attendance responses are not collected.
