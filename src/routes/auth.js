import express from 'express';
import { asyncHandler, unauthorized } from '../middleware.js';
import { assertArelEmail, assertDepartment, assertStudentNumber, requireFields } from '../validators/inputValidators.js';
import { comparePassword, createToken, hashPassword } from '../services/authService.js';
import { createStudent } from '../repositories/studentRepository.js';
import { createUser, getUserByEmail, getUserById } from '../repositories/userRepository.js';
import { requireAuth } from '../authMiddleware.js';

export const authRouter = express.Router();

authRouter.post('/register', asyncHandler(async (req, res) => {
  requireFields(req.body, ['full_name', 'student_number', 'email', 'department', 'password']);
  assertArelEmail(req.body.email);
  assertStudentNumber(req.body.student_number);
  assertDepartment(req.body.department);
  if (req.body.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const student = createStudent({
    full_name: req.body.full_name,
    student_number: req.body.student_number,
    email: req.body.email,
    department: req.body.department
  });
  const user = createUser({
    student_id: student.id,
    full_name: req.body.full_name,
    email: req.body.email,
    password_hash: await hashPassword(req.body.password),
    role: 'student',
    managed_club_id: null
  });

  res.status(201).json({ token: createToken(user), user });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const user = getUserByEmail(req.body.email);

  if (!user || !(await comparePassword(req.body.password, user.password_hash))) {
    throw unauthorized('Email or password is incorrect.');
  }

  res.json({ token: createToken(user), user: getUserById(user.id) });
}));

authRouter.get('/me', requireAuth, asyncHandler((req, res) => {
  res.json(req.user);
}));
