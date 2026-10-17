-- Put the current English, Yorùbá, and user-supplied records in one visible collection.
-- Keep source_hymnal values unchanged as provenance; no hymn rows are deleted.
begin;

insert into public.categories (name)
values ('Consolation Hymn')
on conflict do nothing;

update public.hymns
set category = 'Consolation Hymn'
where category in ('CAC GHB', 'CAC YHB', 'Uploaded Hymn Collection')
   or source_hymnal in (
     'Christ Apostolic Church Gospel Hymn Book',
     'Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)',
     'Uploaded Hymn Collection'
   );

update public.admin_settings
set default_hymn_category = 'Consolation Hymn'
where default_hymn_category in ('CAC GHB', 'CAC YHB', 'Uploaded Hymn Collection');

update public.hymns
set title_en = case source_hymn_number
  when 38 then 'Lead, Kindly Light, Amid the Encircling Gloom'
  when 55 then 'There Is a Fountain Fill''d with Blood'
  when 78 then 'All to Jesus I Surrender'
  when 82 then 'Though the World Allure with Its Gilded Charm'
  when 120 then 'More Holiness Give Me, More Strivings Within'
  when 233 then 'There Is Singing in Heav''n Such as We Have Never Known'
  else title_en
end
where source_hymnal = 'Christ Apostolic Church Gospel Hymn Book'
  and source_hymn_number in (38, 55, 78, 82, 120, 233);

delete from public.categories c
where c.name in ('CAC GHB', 'CAC YHB', 'Uploaded Hymn Collection')
  and not exists (select 1 from public.hymns h where h.category = c.name)
  and not exists (select 1 from public.admin_settings s where s.default_hymn_category = c.name);

commit;
