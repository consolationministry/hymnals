-- Keep the current photographed 152-entry CAC Gospel Hymn Book index.
-- This permanently deletes superseded English CAC GHB rows (published and draft).
-- Yoruba hymns and rows from all other source hymnals are untouched.
-- Review/back up the Supabase database before running this migration. Saved service plans that
-- reference deleted hymn rows may need those hymn selections replaced afterward.
BEGIN;

DELETE FROM public.hymns AS hymn
WHERE (
  hymn.source_hymnal ILIKE '%Gospel Hymn Book%'
  OR upper(btrim(hymn.source_hymnal)) = 'CAC GHB'
)
AND NOT (hymn.hymn_number = ANY (ARRAY[18, 32, 35, 39, 40, 54, 55, 59, 64, 79, 81, 82, 84, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 100, 102, 105, 106, 112, 113, 117, 129, 130, 201, 204, 207, 208, 209, 212, 239, 243, 244, 250, 251, 265, 266, 271, 339, 341, 345, 377, 378, 389, 398, 399, 401, 403, 404, 406, 408, 409, 410, 411, 412, 417, 419, 430, 434, 436, 437, 438, 440, 444, 446, 462, 464, 469, 470, 482, 490, 506, 514, 522, 530, 535, 536, 538, 541, 577, 580, 583, 589, 593, 599, 638, 645, 647, 657, 667, 681, 683, 684, 687, 688, 691, 702, 705, 716, 729, 731, 732, 735, 743, 746, 750, 757, 779, 782, 786, 787, 789, 805, 817, 820, 827, 830, 831, 832, 834, 835, 836, 839, 840, 842, 844, 850, 880, 882, 884, 885, 893, 917, 946, 963, 964, 966, 968, 974, 978, 980, 985, 993]::integer[]));

COMMIT;
