import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAFT_KEY, readDraft, saveDraft, clearDraft } from '../draft.mjs';
import { EXAMPLE, loadBulletin, saveBulletin } from '../bulletin.mjs';

function memory() {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
}

test('unfinished drafts survive reopening without replacing a saved bulletin', () => {
  const storage = memory();
  saveBulletin(storage, EXAMPLE);
  const draft = { v: 1, station: '', title: 'Work in progress 👻', body: '\n\n', base: JSON.stringify(EXAMPLE) };
  assert.equal(saveDraft(storage, draft), true);
  assert.deepEqual(readDraft(storage), draft);
  assert.deepEqual(loadBulletin(storage), EXAMPLE);
  assert.equal(clearDraft(storage, draft), true);
  assert.equal(readDraft(storage), null);
  assert.deepEqual(loadBulletin(storage), EXAMPLE);
});

test('draft recovery accepts Unicode character budgets and incomplete line layouts', () => {
  const storage = memory();
  const draft = { v: 1, station: '👻'.repeat(24), title: '标'.repeat(40), body: '\n'.repeat(480) };
  assert.equal(saveDraft(storage, { ...draft, secret: 'discard' }), true);
  assert.deepEqual(readDraft(storage), draft);
  assert.equal(saveDraft(storage, { ...draft, body: 'a'.repeat(481) }), false);
  assert.deepEqual(readDraft(storage), draft);
});

test('corrupt drafts and denied storage fail explicitly', () => {
  const storage = memory();
  for (const raw of ['{', 'null', '{}', JSON.stringify({ ...EXAMPLE, v: 2 }), JSON.stringify({ ...EXAMPLE, station: 42 })]) {
    storage.setItem(DRAFT_KEY, raw);
    assert.equal(readDraft(storage), null);
  }
  const denied = { getItem() { throw Error('denied'); }, setItem() { throw Error('quota'); } };
  assert.equal(readDraft(denied), null);
  assert.equal(saveDraft(denied, EXAMPLE), false);
  assert.equal(clearDraft(denied, EXAMPLE), false);
});

test('finishing an older editor preserves a different draft backed up by another tab', () => {
  const storage = memory();
  const first = { v: 1, station: 'CLUB', title: 'First', body: 'First draft' };
  const second = { ...first, title: 'Second', body: 'Unfinished work from another tab' };
  saveDraft(storage, first);
  saveDraft(storage, second);
  assert.equal(clearDraft(storage, first), true);
  assert.deepEqual(readDraft(storage), second);
  assert.equal(clearDraft(storage, readDraft(storage)), true);
  assert.equal(readDraft(storage), null);
});

test('an editor that owns no backup cannot delete another tab draft', () => {
  const storage = memory();
  saveDraft(storage, EXAMPLE);
  const expected = readDraft(storage);
  assert.equal(clearDraft(storage, null), true);
  assert.deepEqual(readDraft(storage), expected);
});
