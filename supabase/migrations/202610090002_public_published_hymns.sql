-- Let the member web and Android apps read only published hymn content.
-- Keep drafts and all admin-only tables private to administrators.
grant select (
  id,
  hymn_number,
  title_en,
  title_yoruba,
  first_line_en,
  first_line_yoruba,
  category,
  verses_en,
  verses_yoruba,
  chorus_en,
  chorus_yoruba,
  keywords,
  author_en,
  source_hymnal,
  source_publication_year,
  source_hymn_number,
  source_first_line_en,
  source_hymnary_url,
  lyrics_source_url,
  status
) on public.hymns to anon;

drop policy if exists hymns_public_published_read on public.hymns;
create policy hymns_public_published_read on public.hymns
for select to anon
using (status = 'published');
