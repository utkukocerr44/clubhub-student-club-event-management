import assert from 'node:assert/strict';
import test from 'node:test';
import { comparePassword, createToken, hashPassword, verifyToken } from '../src/services/authService.js';

test('hashes and verifies passwords', async () => {
  const passwordHash = await hashPassword('clubhub123');
  assert.equal(await comparePassword('clubhub123', passwordHash), true);
  assert.equal(await comparePassword('wrong-password', passwordHash), false);
});

test('creates JWT tokens with role data', () => {
  const token = createToken({
    id: 7,
    role: 'club_manager',
    student_id: 11,
    managed_club_id: 3
  });
  const payload = verifyToken(token);

  assert.equal(payload.sub, 7);
  assert.equal(payload.role, 'club_manager');
  assert.equal(payload.student_id, 11);
  assert.equal(payload.managed_club_id, 3);
});
