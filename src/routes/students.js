import express from 'express';
import { requireAuth, requireRole } from '../authMiddleware.js';
import { asyncHandler } from '../middleware.js';
import { assertArelEmail, assertDepartment, assertId, assertStudentNumber, requireFields } from '../validators/inputValidators.js';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  listStudents,
  updateStudent
} from '../repositories/studentRepository.js';

export const studentsRouter = express.Router();
studentsRouter.use(requireAuth, requireRole('admin'));

studentsRouter.get('/', asyncHandler((req, res) => {
  res.json(listStudents());
}));

studentsRouter.get('/:id', asyncHandler((req, res) => {
  const student = getStudentById(assertId(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student was not found.' });
  return res.json(student);
}));

studentsRouter.post('/', asyncHandler((req, res) => {
  requireFields(req.body, ['full_name', 'student_number', 'email', 'department']);
  assertArelEmail(req.body.email);
  assertStudentNumber(req.body.student_number);
  assertDepartment(req.body.department);
  res.status(201).json(createStudent(req.body));
}));

studentsRouter.put('/:id', asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  requireFields(req.body, ['full_name', 'student_number', 'email', 'department']);
  assertArelEmail(req.body.email);
  assertStudentNumber(req.body.student_number);
  assertDepartment(req.body.department);
  const student = updateStudent(id, req.body);
  if (!student) return res.status(404).json({ error: 'Student was not found.' });
  return res.json(student);
}));

studentsRouter.delete('/:id', asyncHandler((req, res) => {
  const changes = deleteStudent(assertId(req.params.id));
  if (!changes) return res.status(404).json({ error: 'Student was not found.' });
  return res.status(204).send();
}));
