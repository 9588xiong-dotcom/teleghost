import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAMPLE, validateBulletin, encodeBulletin, decodeBulletin, wrapBulletin, loadBulletin, saveBulletin, saveBulletinWithConfirmation, shareURL } from '../bulletin.mjs';

test('Unicode and HTML-like text round trip as inert strings', () => {
  for (const body of ['Hello world', '你好，世界 👻 café', '<img src=x onerror=alert(1)>', 'a\n\nb']) {
    const value = { ...EXAMPLE, body };
    assert.deepEqual(decodeBulletin(encodeBulletin(value)), value);
  }
});
test('rejects malformed, oversize, unsupported and invalid payloads', () => {
  for (const token of ['', '%bad', 'A'.repeat(6001), 'e30']) assert.throws(() => decodeBulletin(token));
  for (const fields of [{ v: 2 }, { station: '' }, { body: 'x'.repeat(481) }, { body: 'a\n'.repeat(17) }, { title: 'a\nb' }, { created: 'invalid' }]) {
    assert.throws(() => validateBulletin({ ...EXAMPLE, ...fields }));
  }
});
test('word wrapping preserves blank lines and splits long Unicode words', () => {
  assert.deepEqual(wrapBulletin('one two three\n\nend', 7), ['one two', 'three', '', 'end']);
  assert.deepEqual(wrapBulletin('👻'.repeat(5), 2), ['👻👻', '👻👻', '👻']);
});
test('generated packets round trip across valid lengths', () => {
  for (let count = 1; count <= 480; count += 7) {
    const value = { ...EXAMPLE, body: 'a'.repeat(count) };
    assert.deepEqual(decodeBulletin(encodeBulletin(value)), value);
    assert.ok(wrapBulletin(value.body).every(line => [...line].length <= 40));
  }
});
test('share payload stays in fragment and works under a deployment subpath', () => {
  const url = new URL(shareURL('https://example.com/teleghost/?unused=1#500', EXAMPLE));
  assert.equal(url.pathname, '/teleghost/');
  assert.equal(url.search, '');
  assert.deepEqual(decodeBulletin(url.hash.slice(5)), EXAMPLE);
});
test('storage corruption and denial never masquerade as success', () => {
  const values = new Map();
  const storage = { getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) };
  assert.equal(loadBulletin(storage), null);
  saveBulletin(storage, EXAMPLE);
  assert.deepEqual(loadBulletin(storage), EXAMPLE);
  assert.equal(loadBulletin({ getItem() { throw Error('denied'); } }), null);
  assert.throws(() => saveBulletin({ setItem() { throw Error('quota'); } }, EXAMPLE), /could not save/);
});

function memory() {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
}

test('saving against the unchanged baseline skips confirmation and reports storage failure', async () => {
  const storage = memory();
  const unexpected = () => assert.fail('Unchanged baseline should not prompt');
  assert.deepEqual(await saveBulletinWithConfirmation(storage, EXAMPLE, 'null', unexpected), EXAMPLE);
  const revised = { ...EXAMPLE, title: 'Revised' };
  await saveBulletinWithConfirmation(storage, revised, JSON.stringify(EXAMPLE), unexpected);
  assert.deepEqual(loadBulletin(storage), revised);
  await assert.rejects(saveBulletinWithConfirmation({ getItem: () => null, setItem() { throw Error('quota'); } }, EXAMPLE, 'null', unexpected), /could not save/);
});

test('cancelling replacement preserves the current saved bulletin', async () => {
  const storage = memory();
  saveBulletin(storage, EXAMPLE);
  let prompts = 0;
  const result = await saveBulletinWithConfirmation(storage, { ...EXAMPLE, title: 'Incoming' }, null, async () => { prompts++; return false; });
  assert.equal(result, null);
  assert.equal(prompts, 1);
  assert.deepEqual(loadBulletin(storage), EXAMPLE);
});

test('a change while confirmation is open requires another confirmation and can be cancelled', async () => {
  const storage = memory();
  saveBulletin(storage, EXAMPLE);
  const newer = { ...EXAMPLE, title: 'Newer from another tab' };
  let prompts = 0;
  const result = await saveBulletinWithConfirmation(storage, { ...EXAMPLE, title: 'My draft' }, 'null', async () => {
    prompts++;
    if (prompts === 1) { saveBulletin(storage, newer); return true; }
    return false;
  });
  assert.equal(result, null);
  assert.equal(prompts, 2);
  assert.deepEqual(loadBulletin(storage), newer);
});

test('confirmed saves retain the originally selected copy despite changes while waiting', async () => {
  const storage = memory();
  saveBulletin(storage, EXAMPLE);
  const candidate = { ...EXAMPLE, title: 'Selected copy' };
  const expected = { ...candidate };
  let prompts = 0;
  await saveBulletinWithConfirmation(storage, candidate, null, async () => {
    prompts++;
    candidate.title = 'Changed UI selection';
    if (prompts === 1) saveBulletin(storage, { ...EXAMPLE, title: 'Another saved version' });
    return true;
  });
  assert.equal(prompts, 2);
  assert.deepEqual(loadBulletin(storage), expected);
});
