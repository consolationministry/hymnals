import { readLocal, writeLocal } from "./local-store.js";

const RECENTS_KEY = "cerc-hymnal-recent-v1";

export function getRecentNumbers() {
  const recent = readLocal(RECENTS_KEY, []);
  return Array.isArray(recent) ? recent.map(Number) : [];
}

export function addRecent(number) {
  const next = [Number(number), ...getRecentNumbers().filter(function (value) { return value !== Number(number); })].slice(0, 6);
  return writeLocal(RECENTS_KEY, next);
}
