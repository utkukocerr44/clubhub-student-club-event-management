import express from 'express';
import { db } from '../db/database.js';
import { requireAuth } from '../authMiddleware.js';
import { asyncHandler } from '../middleware.js';

export const dashboardRouter = express.Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get('/', asyncHandler((req, res) => {
  if (req.user.role === 'student') {
    return res.json(studentDashboard(req.user.student_id));
  }

  if (req.user.role === 'club_manager') {
    return res.json(managerDashboard(req.user.managed_club_id));
  }

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

function studentDashboard(studentId) {
  return {
    totals: {
      clubs: db.prepare("SELECT COUNT(*) AS count FROM memberships WHERE student_id = ? AND status = 'approved'").get(studentId).count,
      memberships: db.prepare('SELECT COUNT(*) AS count FROM memberships WHERE student_id = ?').get(studentId).count,
      events: db.prepare(`
        SELECT COUNT(*) AS count
        FROM events
        JOIN memberships ON memberships.club_id = events.club_id
        WHERE memberships.student_id = ? AND memberships.status = 'approved'
      `).get(studentId).count,
      registrations: db.prepare("SELECT COUNT(*) AS count FROM event_registrations WHERE student_id = ? AND status = 'registered'").get(studentId).count
    },
    upcomingEvents: []
  };
}

function managerDashboard(clubId) {
  return {
    totals: {
      clubs: 1,
      members: db.prepare("SELECT COUNT(*) AS count FROM memberships WHERE club_id = ? AND status = 'approved'").get(clubId).count,
      events: db.prepare('SELECT COUNT(*) AS count FROM events WHERE club_id = ?').get(clubId).count,
      registrations: db.prepare(`
        SELECT COUNT(*) AS count
        FROM event_registrations
        JOIN events ON events.id = event_registrations.event_id
        WHERE events.club_id = ? AND event_registrations.status = 'registered'
      `).get(clubId).count
    },
    upcomingEvents: []
  };
}
