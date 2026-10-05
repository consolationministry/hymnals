import { readLocal, writeLocal } from "./local-store.js";

const SETTINGS_KEY = "cerc-hymnal-settings-v1";
export const DEFAULT_SETTINGS = Object.freeze({ language: "english", theme: "system", accent: "ruby", fontSize: 21 });

export function getSettings() {
  const stored = readLocal(SETTINGS_KEY, {});
  const settings = Object.assign({}, DEFAULT_SETTINGS, stored && typeof stored === "object" ? stored : {});
  if (!["english", "yoruba", "both"].includes(settings.language)) settings.language = DEFAULT_SETTINGS.language;
  if (!["light", "dark", "system"].includes(settings.theme)) settings.theme = DEFAULT_SETTINGS.theme;
  if (!["ruby", "violet", "berry"].includes(settings.accent)) settings.accent = DEFAULT_SETTINGS.accent;
  settings.fontSize = Math.max(17, Math.min(32, Number(settings.fontSize) || DEFAULT_SETTINGS.fontSize));
  return settings;
}

export function saveSettings(changes) {
  const current = getSettings();
  const next = Object.assign({}, current, changes);
  next.fontSize = Math.max(17, Math.min(32, Number(next.fontSize) || DEFAULT_SETTINGS.fontSize));
  return { settings: next, persisted: writeLocal(SETTINGS_KEY, next) };
}
