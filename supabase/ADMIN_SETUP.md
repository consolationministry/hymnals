# Supabase setup for the web admin

This repository keeps the member hymnal static and offline-capable. The admin page uses Supabase Auth and an admin-only database; it does not use a service-role key.

## One-time setup

1. In Supabase, rotate/revoke any secret or service-role keys that have been exposed. Never place those keys in this repository or the browser.
2. Open the project's SQL Editor and run `migrations/202610090001_admin_backend.sql`.
3. Apply the existing catalog migrations in order as needed for your database. `migrations/202610130001_current_cac_ghb_catalog.sql` and `migrations/202610130002_current_cac_yhb_catalog.sql` are historical steps; the final migration below removes the remaining CAC collections.
4. To display programs and service plans from any date in the member web and Android apps, run `migrations/202610090003_public_programs_and_service_plans.sql` and then `migrations/202610110001_public_program_history.sql`. To show programme post dates and order announcements by newest post, also run `migrations/202610130003_public_programme_feed.sql`; without it, the app falls back to the older public fields and orders programmes by event date.
5. To enable anonymous comments, run `migrations/202610130004_programme_interactions.sql` after the public-feed migrations. Then run `migrations/202610140001_public_programme_votes_and_descriptions.sql` to add editable programme descriptions and public attendance voting. Votes use each programme's admin-configured question and Yes/No labels. One anonymous vote is stored per browser ID and programme; visitors can change their choice or reset it by clearing local storage. Only vote totals and the current browser's choice are returned to the public app. Comments are posted immediately without a name or account, are limited to 500 characters, and are rate-limited to one per browser ID every 20 seconds. Do not post private information in comments. Admin writes to programme and service-plan records remain authenticated.
6. After applying the earlier migrations, back up the database and run `migrations/202610180001_uploaded_hymns_only.sql` to remove the historical CAC GHB/YHB rows and their IDs from saved service plans. This keeps the uploaded English collection and does not restore the deleted historical CAC records.
7. Before deploying the updated web app, run `migrations/202610190001_dual_uploaded_hymn_collections.sql`. It adds the `hymnal_note` field for scripture references, enables the English collection, the separate Yorùbá collection, or both, and sets both collections active by default. It does not delete hymn rows.
8. In Authentication, invite or create the administrator account. Require email confirmation.
9. In the SQL Editor, grant the confirmed account admin access:

   ```sql
   select public.grant_admin_by_email('your-admin-email@example.org');
   ```

   Replace the example with the approved admin email. The email is intentionally not stored in this public repository.
10. Open the admin URL and sign in. The admin sync imports any missing English and Yorùbá source-catalog records as drafts; it preserves existing rows and publication statuses. Review the new Yorùbá drafts, then publish them from the admin workspace to make them visible to members.
11. For the web-only Live Audio broadcast flow, run `migrations/202610200001_live_audio.sql`. This creates separate audio programme and anonymous interaction tables. Audio is sent directly between the admin's and listeners' browsers with WebRTC; this SQL does not add or modify Android-native code. Keep the Supabase Realtime service enabled because it carries WebRTC session signaling. A TURN relay is needed for some mobile-carrier or corporate networks that block direct peer connections.
12. To automatically record completed web broadcasts and keep recordings private until publication, run `migrations/202610210001_live_audio_recordings.sql`. The admin browser uploads the processed audio when a broadcast ends; choosing Draft keeps it hidden from the public Listen page, and choosing Publish enables public playback.

The browser uses only the Supabase project URL and a publishable key. Row-level security denies unauthenticated access and checks the `admin_users` table for every admin-data operation. Do not disable RLS or add a service-role/secret key to client-side files.

## Existing data and scope

The catalog sync preserves existing rows and inserts only missing records from the committed English and Yorùbá source catalogs, in batches; it does not overwrite existing content or delete rows. The 202610180001 migration removes historical CAC GHB/YHB records; the later dual-collection migration enables the new uploaded English and Yorùbá sources and defaults both to active. Newly imported entries are drafts and are not returned to members until an administrator publishes them. Published entries remain public until moved to Drafts. The member apps cache the last successful published list for offline use.

Service plans and programmes are writable only by authenticated administrators. The member app can display records from any date using only the whitelisted display fields in the public-content migrations. Anonymous comments are separate public text records and are not tied to an account; administrators can remove abusive records from the Supabase SQL Editor. Attendance votes are stored separately and expose only aggregate Yes/No counts and each browser's own selection. Admin preferences remain private; admin-side vote totals and view analytics are not shown yet.
