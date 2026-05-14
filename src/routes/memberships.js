import express from 'express';
import { asyncHandler } from '../middleware.js';
import { assertId, requireFields } from '../validators/inputValidators.js';
import { assertMembershipStatus } from '../services/businessRules.js';
import {
  createMembership,
  deleteMembership,
  listMemberships,
  updateMembershipStatus
} from '../repositories/membershipRepository.js';

export const membershipsRouter = express.Router();

membershipsRouter.get('/', asyncHandler((req, res) => {
  res.json(listMemberships());
}));

membershipsRouter.post('/', asyncHandler((req, res) => {
  requireFields(req.body, ['club_id', 'student_id']);
  const membership = {
    club_id: assertId(req.body.club_id, 'club_id'),
    student_id: assertId(req.body.student_id, 'student_id'),
    role: req.body.role || 'member',
    status: req.body.status || 'pending'
  };
  assertMembershipStatus(membership.status);
  res.status(201).json(createMembership(membership));
}));

membershipsRouter.patch('/:id/status', asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  requireFields(req.body, ['status']);
  assertMembershipStatus(req.body.status);
  const membership = updateMembershipStatus(id, req.body.status);
  if (!membership) return res.status(404).json({ error: 'Membership was not found.' });
  return res.json(membership);
}));

membershipsRouter.delete('/:id', asyncHandler((req, res) => {
  const changes = deleteMembership(assertId(req.params.id));
  if (!changes) return res.status(404).json({ error: 'Membership was not found.' });
  return res.status(204).send();
}));
