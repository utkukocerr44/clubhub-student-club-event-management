import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertArelEmail,
  assertDepartment,
  assertStudentNumber
} from '../src/validators/inputValidators.js';

test('accepts only Istanbul Arel University email addresses', () => {
  assert.doesNotThrow(() => assertArelEmail('student@istanbularel.edu.tr'));
  assert.throws(() => assertArelEmail('student@gmail.com'), /Istanbul Arel University/);
});

test('requires a 9 digit student number', () => {
  assert.doesNotThrow(() => assertStudentNumber('220303040'));
  assert.throws(() => assertStudentNumber('abc123'), /9 digits/);
  assert.throws(() => assertStudentNumber('12345678'), /9 digits/);
});

test('accepts only listed departments', () => {
  assert.doesNotThrow(() => assertDepartment('Computer Engineering'));
  assert.throws(() => assertDepartment('asdw'), /allowed department/);
});
