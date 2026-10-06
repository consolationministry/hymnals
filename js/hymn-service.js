import { hymns } from "../data/public-domain-hymns.js";

// Keep hymn data access behind this small service so the source can later be replaced by Supabase.
export async function getAllHymns() {
  return hymns.slice().sort(function (a, b) { return a.hymn_number - b.hymn_number; });
}

export async function getHymnByNumber(number) {
  return hymns.find(function (hymn) { return hymn.hymn_number === Number(number); }) || null;
}
