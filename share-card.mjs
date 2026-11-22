import { validateBulletin, shareURL } from './bulletin.mjs';
import { qrcodegen } from './vendor/qrcodegen.mjs';

const BORDER = 4;
const MAX_VERSION = 25;

export function qrSVG(text) {
  if (typeof text !== 'string' || !text || text.length > 1400) {
    throw new RangeError('This notice is too long for a readable QR code. Copy its share link instead.');
  }
  let qr;
  try {
    qr = qrcodegen.QrCode.encodeSegments(qrcodegen.QrSegment.makeSegments(text),
      qrcodegen.QrCode.Ecc.MEDIUM, 1, MAX_VERSION);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    throw new RangeError('This notice is too long for a readable QR code. Copy its share link instead.');
  }
  const paths = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) paths.push(`M${x + BORDER},${y + BORDER}h1v1h-1z`);
    }
  }
  const size = qr.size + BORDER * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR code for this fixed bulletin" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${paths.join(' ')}" fill="#000"/></svg>`;
}

export function prepareSignalCard(base, bulletin) {
  const value = Object.freeze(validateBulletin(bulletin));
  const url = new URL(shareURL(base, value));
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Open TeleGhost from its website to create a share card.');
  }
  const local = url.hostname === 'localhost' || url.hostname.endsWith('.localhost') ||
    url.hostname === '[::1]' || /^127\./.test(url.hostname);
  let svg = null;
  let reason = '';
  try { svg = qrSVG(url.href); }
  catch (error) {
    if (!(error instanceof RangeError)) throw error;
    reason = error.message;
  }
  return Object.freeze({ value, url: url.href, svg, reason, local,
    site: url.host + url.pathname,
    notice: local ? 'Local preview: this code points to this computer. Create the card on the published site before sharing it with phones.'
      : 'Open once online. Choose Keep on this device and wait for Offline copy ready. Then reopen the same site to read your saved page.' });
}
