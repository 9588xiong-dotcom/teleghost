import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
function worker() {
  const handlers = new Map();
  const requested = [];
  const deleted = [];
  const stored = new Map();
  const scope = 'https://example.com/teleghost/';
  const self = { location: new URL(scope + 'sw.js'), registration: { scope },
    addEventListener: (name, fn) => handlers.set(name, fn), clients: { claim: async () => {} } };
  const caches = {
    has: async () => false,
    open: async () => ({ put: async (url, value) => stored.set(url, value) }),
    match: async key => stored.get(key),
    keys: async () => [`teleghost-shell|${scope}|old`, 'other-app-cache'],
    delete: async key => { deleted.push(key); return true; }
  };
  const fetch = async url => { requested.push(url); return { ok: true, redirected: false, type: 'basic' }; };
  vm.runInNewContext(source, { self, caches, fetch, URL, AbortSignal, console });
  return { handlers, requested, deleted, stored, scope };
}
test('offline shell covers every directly imported browser module and each asset exists', async () => {
  const w = worker();
  let installed;
  w.handlers.get('install')({ waitUntil: p => { installed = p; } });
  await installed;
  for (const url of w.requested) {
    const path = new URL(url).pathname.replace('/teleghost/', '') || 'index.html';
    assert.ok((await stat(new URL('../' + path, import.meta.url))).isFile());
    if (!path.endsWith('.mjs')) continue;
    const module = await readFile(new URL('../' + path, import.meta.url), 'utf8');
    for (const match of module.matchAll(/from ['"](.+?)['"]/g)) {
      assert.ok(w.stored.has(new URL(match[1], url).href), `Missing offline import: ${match[1]}`);
    }
  }
});
test('worker handles shared-fragment navigation while leaving APIs and other apps alone', async () => {
  const w = worker();
  const intercepts = (url, mode = 'cors', method = 'GET') => {
    let intercepted = false;
    w.handlers.get('fetch')({ request: { url, mode, method }, respondWith: () => { intercepted = true; } });
    return intercepted;
  };
  assert.equal(intercepts(w.scope + '#150~packet', 'navigate'), true);
  assert.equal(intercepts(w.scope + 'bulletin.mjs'), true);
  assert.equal(intercepts('https://api.open-meteo.com/v1/forecast'), false);
  assert.equal(intercepts('https://example.com/other/'), false);
  assert.equal(intercepts(w.scope + 'not-in-shell.js'), false);
  assert.equal(intercepts(w.scope, 'navigate', 'POST'), false);
});
test('activation only removes caches belonging to this deployment scope', async () => {
  const w = worker();
  let activated;
  w.handlers.get('activate')({ waitUntil: p => { activated = p; } });
  await activated;
  assert.deepEqual(w.deleted, [`teleghost-shell|${w.scope}|old`]);
});
