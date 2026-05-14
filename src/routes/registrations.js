import express from 'express';
import { asyncHandler } from '../middleware.js';
import { assertId, requireFields } from '../validators/inputValidators.js';
import { assertRegistrationAllowed, REGISTRATION_STATUSES } from '../services/businessRules.js';
import { countRegisteredStudents, getEventById, isStudentRegistered } from '../repositories/eventRepository.js';
import {
  createRegistration,
  deleteRegistration,
  listRegistrations,
  updateRegistrationStatus
} from '../repositories/registrationRepository.js';

export const registrationsRouter = express.Router();

registrationsRouter.get('/', asyncHandler((req, res) => {
  res.json(listRegistrations());
}));

registrationsRouter.post('/', asyncHandler((req, res) => {
  requireFields(req.body, ['event_id', 'student_id']);
  const eventId = assertId(req.body.event_id, 'event_id');
  const studentId = assertId(req.body.student_id, 'student_id');
  const event = getEventById(eventId);
  const registeredCount = countRegisteredStudents(eventId);
  const alreadyRegistered = isStudentRegistered(eventId, studentId);

  assertRegistrationAllowed(event, registeredCount, alreadyRegistered);
  res.status(201).json(createRegistration({ event_id: eventId, student_id: studentId }));
}));

registrationsRouter.patch('/:id/status', asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  requireFields(req.body, ['status']);
  if (!REGISTRATION_STATUSES.includes(req.body.status)) {
    throw new Error('Registration status must be registered, cancelled, or attended.');
  }

  const registration = updateRegistrationStatus(id, req.body.status);
  if (!registration) return res.status(404).json({ error: 'Registration was not found.' });
  return res.json(registration);
}));

registrationsRouter.delete('/:id', asyncHandler((req, res) => {
  const changes = deleteRegistration(assertId(req.params.id));
  if (!changes) return res.status(404).json({ error: 'Registration was not found.' });
  return res.status(204).send();
}));
