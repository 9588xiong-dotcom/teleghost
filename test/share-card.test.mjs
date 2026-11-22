import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAMPLE, decodeBulletin } from '../bulletin.mjs';
import { prepareSignalCard, qrSVG } from '../share-card.mjs';

const site = 'https://example.org/teleghost/';

test('a card carries the exact validated bulletin under the deployment path', () => {
  const value = { ...EXAMPLE, title: 'Tea & stars 🔭', body: '欢迎 / Oslo\nBring <a mug> & a friend.' };
  const card = prepareSignalCard(site + '?tracking=discard#500', value);
  const url = new URL(card.url);
  assert.equal(url.pathname, '/teleghost/');
  assert.equal(url.search, '');
  assert.deepEqual(decodeBulletin(url.hash.slice(5)), value);
  assert.equal(card.local, false);
  assert.ok(card.svg);
  assert.doesNotMatch(card.svg, /<script|<a |欢迎|Oslo|tracking/);
});

test('open cards are detached immutable snapshots of the selected notice', () => {
  const value = { ...EXAMPLE };
  const card = prepareSignalCard(site, value);
  value.title = 'A later edit';
  assert.equal(card.value.title, EXAMPLE.title);
  assert.ok(Object.isFrozen(card));
  assert.ok(Object.isFrozen(card.value));
  assert.equal(decodeBulletin(new URL(card.url).hash.slice(5)).title, EXAMPLE.title);
});

test('loopback cards explain that another phone cannot use the local URL', () => {
  for (const host of ['localhost', 'preview.localhost', '127.0.0.1', '127.0.2.3', '[::1]']) {
    const card = prepareSignalCard(`http://${host}:4184/teleghost/`, EXAMPLE);
    assert.equal(card.local, true);
    assert.match(card.notice, /published site/);
    assert.ok(card.svg);
  }
  assert.equal(prepareSignalCard('https://localhost.example.org/', EXAMPLE).local, false);
});

test('QR output keeps a four-module white border and a bounded square', () => {
  const svg = qrSVG(site + '#150');
  const size = Number(svg.match(/viewBox="0 0 (\d+) \d+"/)[1]);
  assert.ok(size <= 125);
  assert.match(svg, /<rect width="100%" height="100%" fill="#fff"/);
  for (const [, x, y] of svg.matchAll(/M(\d+),(\d+)h1v1h-1z/g)) {
    assert.ok(+x >= 4 && +x < size - 4);
    assert.ok(+y >= 4 && +y < size - 4);
  }
});

test('a full ASCII bulletin fits the QR limit; long Unicode retains a working link', () => {
  const ascii = prepareSignalCard(site, { ...EXAMPLE, station: 'S'.repeat(24), title: 'T'.repeat(40), body: 'A'.repeat(480) });
  assert.ok(ascii.svg);
  const value = { ...EXAMPLE, body: '🔭'.repeat(480) };
  const unicode = prepareSignalCard(site, value);
  assert.equal(unicode.svg, null);
  assert.match(unicode.reason, /Copy its share link/);
  assert.deepEqual(decodeBulletin(new URL(unicode.url).hash.slice(5)), value);
});

test('unsafe base addresses and invalid notices never produce cards', () => {
  for (const base of ['file:///tmp/teleghost/', 'ftp://example.org/', 'https://user:secret@example.org/']) {
    assert.throws(() => prepareSignalCard(base, EXAMPLE), /website/);
  }
  assert.throws(() => prepareSignalCard(site, { ...EXAMPLE, body: '<script>\u0000' }), /Check body/);
  assert.throws(() => qrSVG('A'.repeat(1401)), /too long/);
});
