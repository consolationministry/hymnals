-- Restore the uploaded Yorùbá book as a separate source collection.
-- Keep both user-supplied collections active by default; no hymn rows are deleted.
BEGIN;

ALTER TABLE public.hymns
  ADD COLUMN IF NOT EXISTS hymnal_note text NOT NULL DEFAULT '';

GRANT SELECT (hymnal_note) ON public.hymns TO anon;

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS active_hymnal text NOT NULL DEFAULT 'both';

ALTER TABLE public.admin_settings
  ALTER COLUMN active_hymnal SET DEFAULT 'both';

ALTER TABLE public.admin_settings
  DROP CONSTRAINT IF EXISTS admin_settings_active_hymnal_check;

UPDATE public.admin_settings
SET active_hymnal = 'both'
WHERE active_hymnal IS DISTINCT FROM 'both';

ALTER TABLE public.admin_settings
  ADD CONSTRAINT admin_settings_active_hymnal_check
  CHECK (active_hymnal IN ('uploaded', 'yoruba', 'both'));

INSERT INTO public.admin_settings (id, active_hymnal)
VALUES ('global', 'both')
ON CONFLICT (id) DO UPDATE
SET active_hymnal = EXCLUDED.active_hymnal;

CREATE OR REPLACE FUNCTION public.get_active_hymnal()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT coalesce(
    (SELECT settings.active_hymnal
     FROM public.admin_settings AS settings
     WHERE settings.id = 'global'),
    'both'
  );
$$;

REVOKE ALL ON FUNCTION public.get_active_hymnal() FROM public;
GRANT EXECUTE ON FUNCTION public.get_active_hymnal() TO anon, authenticated;

COMMIT;
