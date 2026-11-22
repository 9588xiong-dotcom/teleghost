// TeleGhost weather snapshots: last successful API conditions per city, kept for at most 24 hours.
// Storage is injected (Web Storage-like: getItem/setItem). No DOM, no global localStorage.

export const CITIES = Object.freeze(['oslo', 'london', 'tokyo']);
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const KEY_PREFIX = 'teleghost.weather.v1.';
const NUMBER_FIELDS = ['temperature', 'feelsLike', 'wind'];
const STRING_FIELDS = ['summary', 'localTime', 'timezone'];

const isCity = (city) => typeof city === 'string' && CITIES.includes(city);
const isTime = (t) => typeof t === 'number' && Number.isFinite(t) && t >= 0;
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Returns a clean copy of valid conditions, or null. Extra fields are dropped. */
function cleanConditions(value) {
  if (!isPlainObject(value)) return null;
  const out = {};
  for (const f of NUMBER_FIELDS) {
    if (typeof value[f] !== 'number' || !Number.isFinite(value[f])) return null;
    out[f] = value[f];
  }
  for (const f of STRING_FIELDS) {
    if (typeof value[f] !== 'string' || value[f].trim() === '') return null;
    out[f] = value[f];
  }
  return out;
}

/** Saves conditions for a supported city. Returns false on invalid input or storage failure. */
export function saveSnapshot(storage, city, conditions, now = Date.now()) {
  const clean = cleanConditions(conditions);
  if (!storage || !isCity(city) || !isTime(now) || !clean) return false;
  try {
    storage.setItem(KEY_PREFIX + city, JSON.stringify({ conditions: clean, savedAt: now }));
    return true;
  } catch {
    return false; // QuotaExceededError, SecurityError, storage disabled, etc.
  }
}

/** Returns {conditions, savedAt} if a valid snapshot is 0..24h old, otherwise null. Never mutates storage. */
export function readSnapshot(storage, city, now = Date.now()) {
  if (!storage || !isCity(city) || !isTime(now)) return null;
  let parsed;
  try {
    const raw = storage.getItem(KEY_PREFIX + city);
    if (typeof raw !== 'string') return null;
    parsed = JSON.parse(raw);
  } catch {
    return null; // storage denied or malformed JSON
  }
  if (!isPlainObject(parsed) || !isTime(parsed.savedAt)) return null;
  const age = now - parsed.savedAt;
  if (age < 0 || age > MAX_AGE_MS) return null; // future timestamp or stale
  const conditions = cleanConditions(parsed.conditions);
  return conditions ? { conditions, savedAt: parsed.savedAt } : null;
}
