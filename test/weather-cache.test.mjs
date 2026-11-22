// Run: node --test test/weather-cache.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveSnapshot, readSnapshot, CITIES, MAX_AGE_MS } from '../weather-cache.mjs';

class MemoryStorage {
  #data = new Map();
  getItem(k) { return this.#data.has(k) ? this.#data.get(k) : null; }
  setItem(k, v) { this.#data.set(k, String(v)); }
  get size() { return this.#data.size; }
  keys() { return [...this.#data.keys()]; }
}

const NOW = Date.UTC(2026, 10, 12, 12, 0, 0);
const OSLO = { temperature: 3.5, feelsLike: -1, wind: 7.2, summary: 'Light rain', localTime: '2026-11-12T13:00', timezone: 'Europe/Oslo' };
const KEY = (city) => `teleghost.weather.v1.${city}`;

test('round trip returns exact conditions and savedAt', () => {
  const s = new MemoryStorage();
  assert.equal(saveSnapshot(s, 'oslo', OSLO, NOW), true);
  assert.deepEqual(readSnapshot(s, 'oslo', NOW), { conditions: OSLO, savedAt: NOW });
  assert.deepEqual(s.keys(), [KEY('oslo')]);
});

test('extra fields are dropped and returned objects are copies', () => {
  const s = new MemoryStorage();
  saveSnapshot(s, 'oslo', { ...OSLO, secret: 'x' }, NOW);
  const a = readSnapshot(s, 'oslo', NOW);
  assert.deepEqual(a.conditions, OSLO);
  a.conditions.temperature = 99;
  assert.equal(readSnapshot(s, 'oslo', NOW).conditions.temperature, 3.5);
});

test('cities are isolated with separate keys', () => {
  const s = new MemoryStorage();
  const london = { ...OSLO, temperature: 11, timezone: 'Europe/London' };
  const tokyo = { ...OSLO, temperature: 16, timezone: 'Asia/Tokyo' };
  saveSnapshot(s, 'oslo', OSLO, NOW);
  assert.equal(readSnapshot(s, 'london', NOW), null);
  saveSnapshot(s, 'london', london, NOW);
  saveSnapshot(s, 'tokyo', tokyo, NOW);
  assert.deepEqual(s.keys().sort(), CITIES.map(KEY).sort());
  assert.deepEqual(readSnapshot(s, 'oslo', NOW).conditions, OSLO);
  assert.deepEqual(readSnapshot(s, 'london', NOW).conditions, london);
  assert.deepEqual(readSnapshot(s, 'tokyo', NOW).conditions, tokyo);
  s.setItem(KEY('london'), '{broken');
  assert.equal(readSnapshot(s, 'london', NOW), null);
  assert.deepEqual(readSnapshot(s, 'oslo', NOW).conditions, OSLO);
});

test('unsupported cities are rejected on write and read', () => {
  const s = new MemoryStorage();
  for (const city of ['paris', 'Oslo', ' oslo', '', '__proto__', 'constructor', undefined, null, 1, {}]) {
    assert.equal(saveSnapshot(s, city, OSLO, NOW), false, String(city));
    assert.equal(readSnapshot(s, city, NOW), null, String(city));
  }
  s.setItem(KEY('paris'), JSON.stringify({ conditions: OSLO, savedAt: NOW }));
  assert.equal(readSnapshot(s, 'paris', NOW), null);
  assert.equal(s.size, 1); // only the record planted above
});

test('invalid conditions are rejected and do not overwrite a good snapshot', () => {
  const s = new MemoryStorage();
  saveSnapshot(s, 'oslo', OSLO, NOW - 1000);
  const bad = [
    null, undefined, 'sunny', 42, [], [OSLO],
    { ...OSLO, temperature: NaN }, { ...OSLO, feelsLike: Infinity }, { ...OSLO, wind: -Infinity },
    { ...OSLO, wind: '7' }, { ...OSLO, temperature: null }, { ...OSLO, summary: '' },
    { ...OSLO, summary: '   ' }, { ...OSLO, localTime: 123 }, { ...OSLO, timezone: undefined },
  ];
  for (const f of ['temperature', 'feelsLike', 'wind', 'summary', 'localTime', 'timezone']) {
    const { [f]: _omit, ...rest } = OSLO;
    bad.push(rest);
  }
  for (const c of bad) assert.equal(saveSnapshot(s, 'oslo', c, NOW), false, JSON.stringify(c));
  assert.equal(readSnapshot(s, 'oslo', NOW).savedAt, NOW - 1000);
});

test('corrupt or tampered records read as null without being modified', () => {
  const s = new MemoryStorage();
  const records = [
    '', '{broken', 'null', '[]', '"text"', '42', '{}',
    JSON.stringify({ conditions: OSLO }),
    JSON.stringify({ savedAt: NOW }),
    JSON.stringify({ conditions: OSLO, savedAt: String(NOW) }),
    JSON.stringify({ conditions: OSLO, savedAt: -1 }),
    JSON.stringify({ conditions: { ...OSLO, wind: '7' }, savedAt: NOW }),
    JSON.stringify({ conditions: { ...OSLO, summary: '' }, savedAt: NOW }),
    JSON.stringify({ conditions: [OSLO], savedAt: NOW }),
    '{"conditions":' + JSON.stringify(OSLO).replace('3.5', '1e999') + ',"savedAt":' + NOW + '}',
  ];
  for (const raw of records) {
    s.setItem(KEY('oslo'), raw);
    assert.equal(readSnapshot(s, 'oslo', NOW), null, raw);
    assert.equal(s.getItem(KEY('oslo')), raw);
  }
});

test('age boundaries: 0 and exactly 24h accepted, future and >24h rejected', () => {
  const s = new MemoryStorage();
  saveSnapshot(s, 'tokyo', OSLO, NOW);
  assert.notEqual(readSnapshot(s, 'tokyo', NOW), null);
  assert.notEqual(readSnapshot(s, 'tokyo', NOW + MAX_AGE_MS), null);
  assert.equal(readSnapshot(s, 'tokyo', NOW + MAX_AGE_MS + 1), null);
  assert.equal(readSnapshot(s, 'tokyo', NOW - 1), null); // savedAt in the future
  assert.equal(MAX_AGE_MS, 86_400_000);
});

test('invalid now values are rejected', () => {
  const s = new MemoryStorage();
  for (const now of [NaN, Infinity, -1, '2026', null]) {
    assert.equal(saveSnapshot(s, 'oslo', OSLO, now), false, String(now));
  }
  saveSnapshot(s, 'oslo', OSLO, NOW);
  for (const now of [NaN, Infinity, -1, '2026', null]) {
    assert.equal(readSnapshot(s, 'oslo', now), null, String(now));
  }
});

test('storage errors and missing storage are handled', () => {
  const quota = { getItem: () => null, setItem() { throw new DOMException('full', 'QuotaExceededError'); } };
  const denied = { getItem() { throw new DOMException('denied', 'SecurityError'); }, setItem() { throw new DOMException('denied', 'SecurityError'); } };
  const nonString = { getItem: () => 42, setItem() {} };
  assert.equal(saveSnapshot(quota, 'oslo', OSLO, NOW), false);
  assert.equal(saveSnapshot(denied, 'oslo', OSLO, NOW), false);
  assert.equal(readSnapshot(denied, 'oslo', NOW), null);
  assert.equal(readSnapshot(nonString, 'oslo', NOW), null);
  assert.equal(readSnapshot({}, 'oslo', NOW), null); // getItem missing -> TypeError caught
  assert.equal(saveSnapshot({}, 'oslo', OSLO, NOW), false);
  for (const st of [null, undefined]) {
    assert.equal(saveSnapshot(st, 'oslo', OSLO, NOW), false);
    assert.equal(readSnapshot(st, 'oslo', NOW), null);
  }
});

test('default now uses Date.now and global localStorage is never touched', (t) => {
  t.mock.method(Date, 'now', () => NOW);
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('global localStorage used'); } });
  try {
    const s = new MemoryStorage();
    assert.equal(saveSnapshot(s, 'london', OSLO), true);
    assert.equal(readSnapshot(s, 'london').savedAt, NOW);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
