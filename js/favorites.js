import { readLocal, writeLocal } from "./local-store.js";

const FAVORITES_KEY = "cerc-hymnal-favorites-v2";

export function getFavorites() {
  const ids = readLocal(FAVORITES_KEY, []);
  return Array.isArray(ids) ? ids.map(String) : [];
}

export function isFavorite(number) {
  return getFavorites().includes(String(number));
}

export function toggleFavorite(number) {
  const id = String(number);
  const favorites = new Set(getFavorites());
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  const saved = Array.from(favorites).sort(function (a, b) { return Number(a) - Number(b); });
  const persisted = writeLocal(FAVORITES_KEY, saved);
  return { isFavorite: favorites.has(id), persisted: persisted };
}
