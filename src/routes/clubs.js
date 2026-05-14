import express from 'express';
import { asyncHandler } from '../middleware.js';
import { assertEmail, assertId, requireFields } from '../validators/inputValidators.js';
import { createClub, deleteClub, getClubById, listClubs, updateClub } from '../repositories/clubRepository.js';

export const clubsRouter = express.Router();

/**
 * @swagger
 * /api/clubs:
 *   get:
 *     summary: List all clubs
 *     responses:
 *       200:
 *         description: Club list
 */
clubsRouter.get('/', asyncHandler((req, res) => {
  res.json(listClubs());
}));

clubsRouter.get('/:id', asyncHandler((req, res) => {
  const club = getClubById(assertId(req.params.id));
  if (!club) return res.status(404).json({ error: 'Club was not found.' });
  return res.json(club);
}));

/**
 * @swagger
 * /api/clubs:
 *   post:
 *     summary: Create a club
 *     responses:
 *       201:
 *         description: Created club
 */
clubsRouter.post('/', asyncHandler((req, res) => {
  requireFields(req.body, ['name', 'category', 'description', 'president_name', 'contact_email']);
  assertEmail(req.body.contact_email);
  const club = createClub(req.body);
  res.status(201).json(club);
}));

clubsRouter.put('/:id', asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  requireFields(req.body, ['name', 'category', 'description', 'president_name', 'contact_email']);
  assertEmail(req.body.contact_email);
  const club = updateClub(id, req.body);
  if (!club) return res.status(404).json({ error: 'Club was not found.' });
  return res.json(club);
}));

clubsRouter.delete('/:id', asyncHandler((req, res) => {
  const changes = deleteClub(assertId(req.params.id));
  if (!changes) return res.status(404).json({ error: 'Club was not found.' });
  return res.status(204).send();
}));
