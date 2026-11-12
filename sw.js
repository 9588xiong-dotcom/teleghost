/* TeleGhost service worker: precaches the app shell and serves it cache-first.
 * Bump VERSION whenever sw.js or ANY shell file changes; otherwise visitors
 * keep receiving the previously cached files.
 */
'use strict';

const VERSION = '2026-11-12.3';
const BASE = new URL('./', self.location.href).href; // e.g. https://user.github.io/teleghost/
const CACHE_PREFIX = `teleghost-shell|${self.registration.scope}|`;
const CACHE_NAME = CACHE_PREFIX + VERSION;

const SHELL_URLS = new Set(
  ['./', './index.html', './styles.css', './app.mjs', './pages.mjs', './weather.mjs', './offline.mjs']
    .map((path) => new URL(path, BASE).href),
);
const NAV_URLS = new Set([new URL('./', BASE).href, new URL('./index.html', BASE).href]);

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

async function precache() {
  const existed = await caches.has(CACHE_NAME);
  const cache = await caches.open(CACHE_NAME);
  const deadline = AbortSignal.timeout(20000);
  try {
    // Consume each response body before opening the next connection.
    for (const url of SHELL_URLS) {
      const response = await fetch(url, { cache: 'reload', credentials: 'same-origin', signal: deadline });
      if (!response.ok || response.redirected || response.type !== 'basic') {
        throw new Error(`TeleGhost precache failed for ${url} (status ${response.status})`);
      }
      await cache.put(url, response);
    }
  } catch (error) {
    // Never delete a cache that an already-active worker may be using.
    if (!existed) await caches.delete(CACHE_NAME);
    throw error;
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      // Only claims clients inside this registration's scope.
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.search !== '') return;
  url.hash = '';

  const allowed = request.mode === 'navigate' ? NAV_URLS : SHELL_URLS;
  if (!allowed.has(url.href)) return; // weather API, other paths, other apps: untouched

  event.respondWith(cacheFirst(request, url.href));
});

async function cacheFirst(request, key) {
  const cached = await caches.match(key, { cacheName: CACHE_NAME });
  return cached || fetch(request);
}
