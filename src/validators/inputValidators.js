export function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}.`);
  }
}

export function assertEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error('Email format is invalid.');
  }
}

export function assertArelEmail(email) {
  assertEmail(email);
  if (!email.toLowerCase().endsWith('@istanbularel.edu.tr')) {
    throw new Error('Email must be an Istanbul Arel University email address.');
  }
}

export function assertStudentNumber(studentNumber) {
  const studentNumberPattern = /^\d{9}$/;
  if (!studentNumberPattern.test(String(studentNumber))) {
    throw new Error('Student number must be exactly 9 digits.');
  }
}

export const ALLOWED_DEPARTMENTS = [
  'Software Engineering',
  'Computer Engineering',
  'Management Information Systems',
  'Industrial Engineering',
  'Psychology',
  'Visual Communication Design',
  'Business Administration',
  'Electrical and Electronics Engineering'
];

export function assertDepartment(department) {
  if (!ALLOWED_DEPARTMENTS.includes(department)) {
    throw new Error('Department must be selected from the allowed department list.');
  }
}

export function assertNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }
}

export function assertId(value, fieldName = 'id') {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
  return parsed;
}
