import express from 'express';
import { requireAuth, requireRole } from '../authMiddleware.js';
import { asyncHandler } from '../middleware.js';
import { assertId, requireFields } from '../validators/inputValidators.js';
import { assertEventStatus, assertFutureEventDate, assertPositiveCapacity } from '../services/businessRules.js';
import {
  createEvent,
  deleteEvent,
  getEventById,
  listEvents,
  listEventsForClub,
  listEventsForStudent,
  updateEvent
} from '../repositories/eventRepository.js';

export const eventsRouter = express.Router();
eventsRouter.use(requireAuth);

eventsRouter.get('/', asyncHandler((req, res) => {
  if (req.user.role === 'student') return res.json(listEventsForStudent(req.user.student_id));
  if (req.user.role === 'club_manager') return res.json(listEventsForClub(req.user.managed_club_id));
  return res.json(listEvents());
}));

eventsRouter.get('/:id', asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  const visibleEvents = req.user.role === 'student'
    ? listEventsForStudent(req.user.student_id)
    : req.user.role === 'club_manager'
      ? listEventsForClub(req.user.managed_club_id)
      : listEvents();
  const event = visibleEvents.find((item) => item.id === id);
  if (!event) return res.status(404).json({ error: 'Event was not found.' });
  return res.json(event);
}));

eventsRouter.post('/', requireRole('admin', 'club_manager'), asyncHandler((req, res) => {
  requireFields(req.body, ['club_id', 'title', 'description', 'location', 'event_date', 'capacity']);
  const event = normalizeEvent(req.body);
  enforceManagedClub(req.user, event.club_id);
  assertFutureEventDate(event.event_date);
  assertPositiveCapacity(event.capacity);
  assertEventStatus(event.status);
  res.status(201).json(createEvent(event));
}));

eventsRouter.put('/:id', requireRole('admin', 'club_manager'), asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  requireFields(req.body, ['club_id', 'title', 'description', 'location', 'event_date', 'capacity']);
  const event = normalizeEvent(req.body);
  enforceManagedClub(req.user, event.club_id);
  assertPositiveCapacity(event.capacity);
  assertEventStatus(event.status);
  const updated = updateEvent(id, event);
  if (!updated) return res.status(404).json({ error: 'Event was not found.' });
  return res.json(updated);
}));

eventsRouter.delete('/:id', requireRole('admin', 'club_manager'), asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  const currentEvent = getEventById(id);
  if (req.user.role === 'club_manager' && currentEvent?.club_id !== req.user.managed_club_id) {
    return res.status(403).json({ error: 'Club managers can only delete their own club events.' });
  }
  const changes = deleteEvent(id);
  if (!changes) return res.status(404).json({ error: 'Event was not found.' });
  return res.status(204).send();
}));

function normalizeEvent(body) {
  return {
    club_id: assertId(body.club_id, 'club_id'),
    title: body.title,
    description: body.description,
    location: body.location,
    event_date: body.event_date,
    capacity: Number(body.capacity),
    status: body.status || 'scheduled'
  };
}

function enforceManagedClub(user, clubId) {
  if (user.role === 'club_manager' && clubId !== user.managed_club_id) {
    const error = new Error('Club managers can only manage their own club events.');
    error.statusCode = 403;
    throw error;
  }
}
