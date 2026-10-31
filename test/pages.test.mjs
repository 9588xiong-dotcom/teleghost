import test from 'node:test';
import assert from 'node:assert/strict';
import { adjacentPage, appendDigit, lookupPage, PAGE_NUMBERS } from '../pages.mjs';

test('every listed page resolves and page numbers are unique', () => {
  assert.equal(new Set(PAGE_NUMBERS).size, PAGE_NUMBERS.length);
  for (const number of PAGE_NUMBERS) assert.equal(lookupPage(number)?.number, number);
});

test('unknown pages return null', () => {
  assert.equal(lookupPage(999), null);
  assert.equal(lookupPage('not-a-number'), null);
});

test('next and previous pages wrap around', () => {
  assert.equal(adjacentPage(100, -1), 400);
  assert.equal(adjacentPage(400, 1), 100);
  assert.equal(adjacentPage(101, 1), 120);
});

test('digit buffer only accepts digits and retains the newest three', () => {
  assert.equal(appendDigit('12', '3'), '123');
  assert.equal(appendDigit('123', '4'), '234');
  assert.equal(appendDigit('12', 'x'), '12');
});
