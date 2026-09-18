import test from 'node:test';
import assert from 'node:assert/strict';

import { isValidNigerianPhoneNumber } from './registration-logic.js';

test('accepts valid Nigerian phone numbers', () => {
  assert.equal(isValidNigerianPhoneNumber('+2348123456789'), true);
  assert.equal(isValidNigerianPhoneNumber('08123456789'), true);
  assert.equal(isValidNigerianPhoneNumber('2348123456789'), true);
});

test('rejects invalid Nigerian phone numbers', () => {
  assert.equal(isValidNigerianPhoneNumber('812345678'), false);
  assert.equal(isValidNigerianPhoneNumber('0812345678a'), false);
  assert.equal(isValidNigerianPhoneNumber('12345678901'), false);
});
