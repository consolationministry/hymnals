-- Keep the uploaded hymn collection as the only active member-facing hymnal.
-- Remove CAC Gospel Hymn Book and Yoruba Hymn Book rows, but retain uploaded
-- rows and any unrelated source collections.
-- CAC hymn IDs are removed from saved service-plan selections before deletion.
BEGIN;

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS active_hymnal text NOT NULL DEFAULT 'uploaded';

ALTER TABLE public.admin_settings
  ALTER COLUMN active_hymnal SET DEFAULT 'uploaded';

UPDATE public.admin_settings
SET active_hymnal = 'uploaded'
WHERE active_hymnal IS DISTINCT FROM 'uploaded';

INSERT INTO public.admin_settings (id, active_hymnal)
VALUES ('global', 'uploaded')
ON CONFLICT (id) DO UPDATE
SET active_hymnal = EXCLUDED.active_hymnal;

ALTER TABLE public.admin_settings
  DROP CONSTRAINT IF EXISTS admin_settings_active_hymnal_check;

ALTER TABLE public.admin_settings
  ADD CONSTRAINT admin_settings_active_hymnal_check
  CHECK (active_hymnal = 'uploaded');

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
    'uploaded'
  );
$$;

REVOKE ALL ON FUNCTION public.get_active_hymnal() FROM public;
GRANT EXECUTE ON FUNCTION public.get_active_hymnal() TO anon, authenticated;

CREATE TEMP TABLE cac_hymns_to_delete ON COMMIT DROP AS
SELECT hymn.id
FROM public.hymns AS hymn
WHERE btrim(hymn.source_hymnal) <> 'Uploaded Hymn Collection'
  AND (
    upper(btrim(hymn.source_hymnal)) IN ('CAC GHB', 'CAC YHB')
    OR hymn.source_hymnal ILIKE '%Gospel Hymn Book%'
    OR hymn.source_hymnal ILIKE '%Yoruba Hymn Book%'
    OR hymn.source_hymnal ILIKE '%Iwe Orin CAC%'
    OR hymn.category IN ('CAC GHB', 'CAC YHB')
  );

UPDATE public.service_plans AS plan
SET hymn_ids = ARRAY(
  SELECT selected.hymn_id
  FROM unnest(plan.hymn_ids) WITH ORDINALITY AS selected(hymn_id, position)
  WHERE NOT EXISTS (
    SELECT 1
    FROM cac_hymns_to_delete AS removed
    WHERE removed.id = selected.hymn_id
  )
  ORDER BY selected.position
)
WHERE EXISTS (
  SELECT 1
  FROM unnest(plan.hymn_ids) AS selected(hymn_id)
  JOIN cac_hymns_to_delete AS removed ON removed.id = selected.hymn_id
);

DELETE FROM public.hymns AS hymn
USING cac_hymns_to_delete AS removed
WHERE hymn.id = removed.id;

DELETE FROM public.categories AS category
WHERE category.name IN ('CAC GHB', 'CAC YHB')
  AND NOT EXISTS (
    SELECT 1 FROM public.hymns AS hymn WHERE hymn.category = category.name
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_settings AS settings
    WHERE settings.default_hymn_category = category.name
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.hymns AS hymn
    WHERE btrim(hymn.source_hymnal) <> 'Uploaded Hymn Collection'
      AND (
        upper(btrim(hymn.source_hymnal)) IN ('CAC GHB', 'CAC YHB')
        OR hymn.source_hymnal ILIKE '%Gospel Hymn Book%'
        OR hymn.source_hymnal ILIKE '%Yoruba Hymn Book%'
        OR hymn.source_hymnal ILIKE '%Iwe Orin CAC%'
        OR hymn.category IN ('CAC GHB', 'CAC YHB')
      )
  ) THEN
    RAISE EXCEPTION 'CAC hymn rows remain after uploaded-only cleanup';
  END IF;
END $$;

COMMIT;
