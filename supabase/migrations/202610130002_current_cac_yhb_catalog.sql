-- Keep the 152 CAC Yoruba Hymn Book records whose printed numbers appear in
-- the current English index. Matching numbers are a selection rule, not a
-- claim that the English and Yorùbá texts are verified translations.
-- The allowlist contains stable app/database hymn_number IDs; it includes
-- both distinct Yorùbá entries numbered 10.
-- This permanently deletes superseded CAC YHB rows (published and draft).
-- Back up first. Saved service plans that reference deleted rows may need
-- their hymn selections updated.
BEGIN;

DELETE FROM public.hymns AS hymn
WHERE (
  hymn.source_hymnal ILIKE '%Yoruba Hymn Book%'
  OR hymn.source_hymnal ILIKE '%Iwe Orin CAC%'
  OR upper(btrim(hymn.source_hymnal)) = 'CAC YHB'
)
AND NOT (hymn.hymn_number = ANY (ARRAY[
  1017, 1018, 1030, 1033, 1037, 1038, 1052, 1053, 1057, 1062, 1077, 1079, 1080, 1082, 1085, 1086,
  1087, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1098, 1100, 1103, 1104, 1110, 1111, 1115,
  1127, 1128, 1200, 1203, 1206, 1207, 1208, 1211, 1238, 1242, 1243, 1249, 1250, 1264, 1265, 1270,
  1338, 1340, 1344, 1376, 1377, 1388, 1396, 1397, 1398, 1400, 1402, 1404, 1405, 1406, 1407, 1408,
  1413, 1415, 1426, 1430, 1432, 1433, 1434, 1436, 1440, 1442, 1458, 1460, 1465, 1466, 1478, 1486,
  1502, 1510, 1518, 1526, 1531, 1532, 1534, 1537, 1573, 1576, 1579, 1585, 1589, 1595, 1634, 1641,
  1643, 1654, 1664, 1678, 1680, 1681, 1684, 1685, 1688, 1699, 1702, 1713, 1726, 1728, 1729, 1732,
  1740, 1743, 1747, 1754, 1776, 1779, 1783, 1784, 1786, 1802, 1814, 1817, 1824, 1827, 1828, 1829,
  1831, 1832, 1833, 1836, 1837, 1839, 1841, 1847, 1877, 1879, 1881, 1882, 1889, 1913, 1942, 1959,
  1960, 1962, 1964, 1970, 1974, 1976, 1982, 1990
]::integer[]));

COMMIT;
