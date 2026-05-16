import express from 'express';
import { requireAuth, requireRole } from '../authMiddleware.js';
import { asyncHandler } from '../middleware.js';
import { assertId, requireFields } from '../validators/inputValidators.js';
import { assertMembershipStatus } from '../services/businessRules.js';
import {
  createMembership,
  deleteMembership,
  getMembershipById,
  listMemberships,
  listMembershipsForClub,
  listMembershipsForStudent,
  updateMembershipStatus
} from '../repositories/membershipRepository.js';

export const membershipsRouter = express.Router();
membershipsRouter.use(requireAuth);

membershipsRouter.get('/', asyncHandler((req, res) => {
  if (req.user.role === 'student') return res.json(listMembershipsForStudent(req.user.student_id));
  if (req.user.role === 'club_manager') return res.json(listMembershipsForClub(req.user.managed_club_id));
  return res.json(listMemberships());
}));

membershipsRouter.post('/', asyncHandler((req, res) => {
  requireFields(req.body, ['club_id']);
  const membership = {
    club_id: assertId(req.body.club_id, 'club_id'),
    student_id: req.user.role === 'student'
      ? req.user.student_id
      : assertId(req.body.student_id, 'student_id'),
    role: req.body.role || 'member',
    status: req.body.status || 'pending'
  };
  assertMembershipStatus(membership.status);
  res.status(201).json(createMembership(membership));
}));

membershipsRouter.patch('/:id/status', requireRole('admin', 'club_manager'), asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  const currentMembership = getMembershipById(id);
  if (req.user.role === 'club_manager' && currentMembership?.club_id !== req.user.managed_club_id) {
    return res.status(403).json({ error: 'Club managers can only update their own club memberships.' });
  }
  requireFields(req.body, ['status']);
  assertMembershipStatus(req.body.status);
  const membership = updateMembershipStatus(id, req.body.status);
  if (!membership) return res.status(404).json({ error: 'Membership was not found.' });
  return res.json(membership);
}));

membershipsRouter.delete('/:id', requireRole('admin', 'club_manager'), asyncHandler((req, res) => {
  const id = assertId(req.params.id);
  const currentMembership = getMembershipById(id);
  if (req.user.role === 'club_manager' && currentMembership?.club_id !== req.user.managed_club_id) {
    return res.status(403).json({ error: 'Club managers can only delete their own club memberships.' });
  }
  const changes = deleteMembership(id);
  if (!changes) return res.status(404).json({ error: 'Membership was not found.' });
  return res.status(204).send();
}));
