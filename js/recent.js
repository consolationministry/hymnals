import { readLocal, writeLocal } from "./local-store.js";

const RECENTS_KEY = "cerc-hymnal-cac-recent-v1";

export function getRecentNumbers() {
  const recent = readLocal(RECENTS_KEY, []);
  return Array.isArray(recent)
    ? Array.from(new Set(recent.map(Number).filter(function (value) { return Number.isFinite(value) && value > 0; }))).slice(0, 50)
    : [];
}

export function addRecent(number) {
  const parsed = Number(number);
  if (!Number.isFinite(parsed) || parsed <= 0) return false;
  const next = [parsed, ...getRecentNumbers().filter(function (value) { return value !== parsed; })].slice(0, 50);
  return writeLocal(RECENTS_KEY, next);
}
