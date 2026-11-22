export const BULLETIN_KEY = 'teleghost.bulletin.v1';
export const EXAMPLE = Object.freeze({
  v: 1, station: 'NIGHT OWL CLUB', title: 'MEET UNDER THE STARS',
  body: 'SATURDAY / 19:30\nCommunity garden, north entrance\n\nBring a warm layer and a mug.\nTea, telescopes, and good company.\n\nCloudy skies? Meet in the library.\nEveryone welcome. No booking needed.',
  created: '2026-11-13T12:00:00.000Z'
});

const length = (text) => [...text].length;
export function validateBulletin(value) {
  if (!value || value.v !== 1) throw new Error('This bulletin version is not supported.');
  for (const [key, max] of [['station', 24], ['title', 40], ['body', 480]]) {
    if (typeof value[key] !== 'string' || !value[key].trim() || length(value[key]) > max ||
      /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value[key]) ||
      (key !== 'body' && /\n/.test(value[key]))) throw new Error(`Check ${key}: use 1–${max} characters of plain text.`);
  }
  if (wrapBulletin(value.body).length > 16) throw new Error('Keep your bulletin to 16 wrapped lines.');
  if (typeof value.created !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value.created) ||
      !Number.isFinite(Date.parse(value.created))) throw new Error('The bulletin date is invalid.');
  return { v: 1, station: value.station, title: value.title, body: value.body, created: value.created };
}

export function wrapBulletin(body, width = 40) {
  if (!Number.isInteger(width) || width < 1) throw new RangeError('Invalid line width');
  return body.split('\n').flatMap((paragraph) => {
    const lines = [];
    let chars = [...paragraph];
    while (chars.length > width) {
      const space = chars.slice(0, width + 1).lastIndexOf(' ');
      const cut = space > 0 ? space : width;
      lines.push(chars.slice(0, cut).join(''));
      chars = chars.slice(cut + (space > 0 ? 1 : 0));
    }
    return [...lines, chars.join('')];
  });
}

export function encodeBulletin(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(validateBulletin(value)));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBulletin(token) {
  if (typeof token !== 'string' || token.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(token)) throw new Error('This shared bulletin link is invalid or too large.');
  try {
    const bytes = Uint8Array.from(atob(token.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    return validateBulletin(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
  } catch { throw new Error('This shared bulletin is damaged or unsupported. Ask the sender for a new link.'); }
}

export function loadBulletin(storage) {
  try { return validateBulletin(JSON.parse(storage.getItem(BULLETIN_KEY))); }
  catch { return null; }
}

export function saveBulletin(storage, value) {
  const clean = validateBulletin(value);
  try { storage.setItem(BULLETIN_KEY, JSON.stringify(clean)); }
  catch { throw new Error('This browser could not save your bulletin. Copy its share link or download a text copy instead.'); }
  return clean;
}

export async function saveBulletinWithConfirmation(storage, value, baseline, confirm) {
  const clean = validateBulletin(value);
  const expected = baseline ?? 'null';
  for (;;) {
    const current = JSON.stringify(loadBulletin(storage));
    if (current === expected) return saveBulletin(storage, clean);
    if (!await confirm()) return null;
    if (JSON.stringify(loadBulletin(storage)) === current) return saveBulletin(storage, clean);
  }
}

export function shareURL(base, value) {
  const url = new URL(base);
  url.search = '';
  url.hash = `150~${encodeBulletin(value)}`;
  return url.href;
}
