export const MIN_SPLASH_VISIBLE_MS = 5000;

export function remainingSplashMs(startedAt, now = Date.now()) {
  const elapsed = Math.max(0, now - startedAt);
  return Math.max(0, MIN_SPLASH_VISIBLE_MS - elapsed);
}
