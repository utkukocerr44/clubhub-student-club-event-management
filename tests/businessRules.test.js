import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertEventStatus,
  assertFutureEventDate,
  assertMembershipStatus,
  assertPositiveCapacity,
  assertRegistrationAllowed,
  calculateAvailableSeats
} from '../src/services/businessRules.js';

test('accepts a future event date', () => {
  assert.doesNotThrow(() => {
    assertFutureEventDate('2026-06-01T10:00:00', new Date('2026-05-14T10:00:00'));
  });
});

test('rejects a past event date', () => {
  assert.throws(() => {
    assertFutureEventDate('2026-05-01T10:00:00', new Date('2026-05-14T10:00:00'));
  }, /future/);
});

test('rejects invalid capacity values', () => {
  assert.throws(() => assertPositiveCapacity(0), /positive integer/);
  assert.throws(() => assertPositiveCapacity(2.5), /positive integer/);
});

test('prevents duplicate event registration', () => {
  const event = {
    status: 'scheduled',
    event_date: '2026-06-01T10:00:00',
    capacity: 20
  };

  assert.throws(() => {
    assertRegistrationAllowed(event, 3, true, new Date('2026-05-14T10:00:00'));
  }, /already registered/);
});

test('prevents registration when event capacity is full', () => {
  const event = {
    status: 'scheduled',
    event_date: '2026-06-01T10:00:00',
    capacity: 3
  };

  assert.throws(() => {
    assertRegistrationAllowed(event, 3, false, new Date('2026-05-14T10:00:00'));
  }, /capacity is full/);
});

test('validates allowed statuses', () => {
  assert.doesNotThrow(() => assertEventStatus('scheduled'));
  assert.doesNotThrow(() => assertMembershipStatus('approved'));
  assert.throws(() => assertEventStatus('draft'), /scheduled/);
  assert.throws(() => assertMembershipStatus('waiting'), /pending/);
});

test('calculates available seats without negative values', () => {
  assert.equal(calculateAvailableSeats(20, 7), 13);
  assert.equal(calculateAvailableSeats(20, 22), 0);
});
