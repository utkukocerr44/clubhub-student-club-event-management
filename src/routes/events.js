import express from 'express';
import { asyncHandler } from '../middleware.js';
import { assertId, requireFields } from '../validators/inputValidators.js';
import { assertEventStatus, assertFutureEventDate, assertPositiveCapacity } from '../services/businessRules.js';
import { createEvent, deleteEvent, getEventById, listEvents, updateEvent } from '../repositories/eventRepository.js';

export const eventsRouter = express.Router();

eventsRouter.get('/', asyncHandler((req, res) => {
  res.json(listEvents());
}));

eventsRouter.get('/:id', asyncHandler((req, res) => {
  const event = getEventById(assertId(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event was not found.' });
  return res.json(event);
}));

eventsRouter.post('/', asyncHandler((req, res) => {
  requireFields(req.body, ['club_id', 'title', 'description', 'location', 'event_date', 'capacity']);
  const event = normalizeEvent(req.body);
  assertFutureEventDate(event.event_date);
  assertPositiveCapacity(event.capacity);
  assertEventStatus(event.status);
  res.status(201).json(createEvent(event));
}));

eventsRouter.put('/:id', asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  requireFields(req.body, ['club_id', 'title', 'description', 'location', 'event_date', 'capacity']);
  const event = normalizeEvent(req.body);
  assertPositiveCapacity(event.capacity);
  assertEventStatus(event.status);
  const updated = updateEvent(id, event);
  if (!updated) return res.status(404).json({ error: 'Event was not found.' });
  return res.json(updated);
}));

eventsRouter.delete('/:id', asyncHandler((req, res) => {
  const changes = deleteEvent(assertId(req.params.id));
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
