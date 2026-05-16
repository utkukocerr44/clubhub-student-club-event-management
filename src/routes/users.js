import express from 'express';
import { requireAuth, requireRole } from '../authMiddleware.js';
import { asyncHandler } from '../middleware.js';
import { listUsers } from '../repositories/userRepository.js';

export const usersRouter = express.Router();

usersRouter.use(requireAuth, requireRole('admin'));

usersRouter.get('/', asyncHandler((req, res) => {
  res.json(listUsers());
}));
