import express from 'express';
import { requireAuth, requireRole } from '../authMiddleware.js';
import { asyncHandler } from '../middleware.js';
import { assertId, requireFields } from '../validators/inputValidators.js';
import { assertRegistrationAllowed, REGISTRATION_STATUSES } from '../services/businessRules.js';
import { countRegisteredStudents, getEventById, isStudentRegistered } from '../repositories/eventRepository.js';
import {
  createRegistration,
  deleteRegistration,
  getRegistrationById,
  listRegistrations,
  listRegistrationsForClub,
  listRegistrationsForStudent,
  updateRegistrationStatus
} from '../repositories/registrationRepository.js';

export const registrationsRouter = express.Router();
registrationsRouter.use(requireAuth);

registrationsRouter.get('/', asyncHandler((req, res) => {
  if (req.user.role === 'student') return res.json(listRegistrationsForStudent(req.user.student_id));
  if (req.user.role === 'club_manager') return res.json(listRegistrationsForClub(req.user.managed_club_id));
  return res.json(listRegistrations());
}));

registrationsRouter.post('/', asyncHandler((req, res) => {
  requireFields(req.body, ['event_id']);
  const eventId = assertId(req.body.event_id, 'event_id');
  const studentId = req.user.role === 'student'
    ? req.user.student_id
    : assertId(req.body.student_id, 'student_id');
  const event = getEventById(eventId);
  const registeredCount = countRegisteredStudents(eventId);
  const alreadyRegistered = isStudentRegistered(eventId, studentId);

  assertRegistrationAllowed(event, registeredCount, alreadyRegistered);
  res.status(201).json(createRegistration({ event_id: eventId, student_id: studentId }));
}));

registrationsRouter.patch('/:id/status', requireRole('admin', 'club_manager'), asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  const currentRegistration = getRegistrationById(id);
  if (req.user.role === 'club_manager' && currentRegistration?.club_id !== req.user.managed_club_id) {
    return res.status(403).json({ error: 'Club managers can only update their own club registrations.' });
  }
  requireFields(req.body, ['status']);
  if (!REGISTRATION_STATUSES.includes(req.body.status)) {
    throw new Error('Registration status must be registered, cancelled, or attended.');
  }

  const registration = updateRegistrationStatus(id, req.body.status);
  if (!registration) return res.status(404).json({ error: 'Registration was not found.' });
  return res.json(registration);
}));

registrationsRouter.delete('/:id', requireRole('admin', 'club_manager'), asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  const currentRegistration = getRegistrationById(id);
  if (req.user.role === 'club_manager' && currentRegistration?.club_id !== req.user.managed_club_id) {
    return res.status(403).json({ error: 'Club managers can only delete their own club registrations.' });
  }
  const changes = deleteRegistration(id);
  if (!changes) return res.status(404).json({ error: 'Registration was not found.' });
  return res.status(204).send();
}));
