import express from 'express';
import { db } from '../db/database.js';
import { asyncHandler } from '../middleware.js';

export const dashboardRouter = express.Router();

dashboardRouter.get('/', asyncHandler((req, res) => {
  const totals = {
    clubs: db.prepare('SELECT COUNT(*) AS count FROM clubs').get().count,
    students: db.prepare('SELECT COUNT(*) AS count FROM students').get().count,
    events: db.prepare('SELECT COUNT(*) AS count FROM events').get().count,
    registrations: db.prepare("SELECT COUNT(*) AS count FROM event_registrations WHERE status = 'registered'").get().count
  };

  const upcomingEvents = db.prepare(`
    SELECT events.id, events.title, events.event_date, clubs.name AS club_name
    FROM events
    JOIN clubs ON clubs.id = events.club_id
    WHERE events.status = 'scheduled'
    ORDER BY events.event_date
    LIMIT 5
  `).all();

  res.json({ totals, upcomingEvents });
}));
