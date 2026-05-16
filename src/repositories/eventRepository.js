import { db } from '../db/database.js';

export function listEvents() {
  return db.prepare(`
    SELECT events.*, clubs.name AS club_name,
      (
        SELECT COUNT(*)
        FROM event_registrations
        WHERE event_registrations.event_id = events.id
          AND event_registrations.status = 'registered'
      ) AS registered_count
    FROM events
    JOIN clubs ON clubs.id = events.club_id
    ORDER BY event_date
  `).all();
}

export function listEventsForStudent(studentId) {
  return db.prepare(`
    SELECT events.*, clubs.name AS club_name,
      (
        SELECT COUNT(*)
        FROM event_registrations
        WHERE event_registrations.event_id = events.id
          AND event_registrations.status = 'registered'
      ) AS registered_count
    FROM events
    JOIN clubs ON clubs.id = events.club_id
    JOIN memberships ON memberships.club_id = clubs.id
    WHERE memberships.student_id = ?
      AND memberships.status = 'approved'
    ORDER BY event_date
  `).all(studentId);
}

export function listEventsForClub(clubId) {
  return db.prepare(`
    SELECT events.*, clubs.name AS club_name,
      (
        SELECT COUNT(*)
        FROM event_registrations
        WHERE event_registrations.event_id = events.id
          AND event_registrations.status = 'registered'
      ) AS registered_count
    FROM events
    JOIN clubs ON clubs.id = events.club_id
    WHERE events.club_id = ?
    ORDER BY event_date
  `).all(clubId);
}

export function getEventById(id) {
  return db.prepare(`
    SELECT events.*, clubs.name AS club_name
    FROM events
    JOIN clubs ON clubs.id = events.club_id
    WHERE events.id = ?
  `).get(id);
}

export function createEvent(event) {
  const result = db.prepare(`
    INSERT INTO events (club_id, title, description, location, event_date, capacity, status)
    VALUES (@club_id, @title, @description, @location, @event_date, @capacity, @status)
  `).run({ ...event, status: event.status || 'scheduled' });

  return getEventById(result.lastInsertRowid);
}

export function updateEvent(id, event) {
  db.prepare(`
    UPDATE events
    SET club_id = @club_id,
        title = @title,
        description = @description,
        location = @location,
        event_date = @event_date,
        capacity = @capacity,
        status = @status
    WHERE id = @id
  `).run({ ...event, id, status: event.status || 'scheduled' });

  return getEventById(id);
}

export function deleteEvent(id) {
  return db.prepare('DELETE FROM events WHERE id = ?').run(id).changes;
}

export function countRegisteredStudents(eventId) {
  return db.prepare(`
    SELECT COUNT(*) AS count
    FROM event_registrations
    WHERE event_id = ? AND status = 'registered'
  `).get(eventId).count;
}

export function isStudentRegistered(eventId, studentId) {
  const row = db.prepare(`
    SELECT id
    FROM event_registrations
    WHERE event_id = ? AND student_id = ? AND status = 'registered'
  `).get(eventId, studentId);

  return Boolean(row);
}
