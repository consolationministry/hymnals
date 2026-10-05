const memoryStore = new Map();

export function readLocal(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored);
  } catch (error) {
    if (memoryStore.has(key)) return memoryStore.get(key);
  }
  return memoryStore.has(key) ? memoryStore.get(key) : fallback;
}

export function writeLocal(key, value) {
  memoryStore.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}
