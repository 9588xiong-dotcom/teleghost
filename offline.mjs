// TeleGhost offline support: registers ./sw.js and reports status in #offline-status.

const SW_URL = new URL('./sw.js', import.meta.url);
const SCOPE_URL = new URL('./', import.meta.url);

const MESSAGES = {
  loading: 'Saving TeleGhost for offline use…',
  pending: 'Offline copy saved. It will be used after the next reload.',
  ready: 'Offline copy ready · your pocket station can travel with you.',
  offline: 'Offline · saved pages available. Weather may show a dated snapshot.',
  'offline-unsaved': 'Offline: this page is not saved for offline use.',
  unsupported: 'Offline use is not available in this browser.',
  error: 'Offline copy could not be saved. Online use is unaffected.',
};

export function initOfflineStatus(el = document.getElementById('offline-status')) {
  if (!el) return;
  if (!el.hasAttribute('role')) el.setAttribute('role', 'status');
  if (!el.hasAttribute('aria-live')) el.setAttribute('aria-live', 'polite');

  const supported = 'serviceWorker' in navigator && window.isSecureContext;
  const status = { phase: supported ? 'loading' : 'unsupported' };
  const isOurs = (worker) => Boolean(worker) && worker.scriptURL === SW_URL.href;

  const render = () => {
    // "ready" requires that our worker actually controls this page.
    const controlled = supported && isOurs(navigator.serviceWorker.controller);
    let key;
    if (!navigator.onLine) key = controlled ? 'offline' : 'offline-unsaved';
    else key = controlled ? 'ready' : status.phase;
    if (el.dataset.state === key) return; // avoid repeat announcements
    el.dataset.state = key;
    el.textContent = MESSAGES[key];
  };

  window.addEventListener('online', render);
  window.addEventListener('offline', render);
  render();
  if (!supported) return;

  navigator.serviceWorker.addEventListener('controllerchange', render);

  const start = () => register(status, render);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

async function register(status, render) {
  let registration;
  try {
    registration = await navigator.serviceWorker.register(SW_URL.href, { scope: SCOPE_URL.href });
  } catch {
    status.phase = 'error';
    render();
    return;
  }

  const sync = () => {
    if (registration.active) status.phase = 'pending'; // installed, but may not control this page
    else if (registration.installing || registration.waiting) status.phase = 'loading';
    else status.phase = 'error'; // first install failed and the worker became redundant
    render();
  };
  const watch = (worker) => worker?.addEventListener('statechange', sync);

  watch(registration.installing);
  watch(registration.waiting);
  registration.addEventListener('updatefound', () => watch(registration.installing));
  sync();
}

initOfflineStatus();
