import { db } from '../db/database.js';

export function listRegistrations() {
  return db.prepare(`
    SELECT event_registrations.*,
           events.title AS event_title,
           students.full_name AS student_name
    FROM event_registrations
    JOIN events ON events.id = event_registrations.event_id
    JOIN students ON students.id = event_registrations.student_id
    ORDER BY event_registrations.registered_at DESC
  `).all();
}

export function listRegistrationsForStudent(studentId) {
  return db.prepare(`
    SELECT event_registrations.*,
           events.title AS event_title,
           students.full_name AS student_name
    FROM event_registrations
    JOIN events ON events.id = event_registrations.event_id
    JOIN students ON students.id = event_registrations.student_id
    WHERE event_registrations.student_id = ?
    ORDER BY event_registrations.registered_at DESC
  `).all(studentId);
}

export function listRegistrationsForClub(clubId) {
  return db.prepare(`
    SELECT event_registrations.*,
           events.title AS event_title,
           students.full_name AS student_name
    FROM event_registrations
    JOIN events ON events.id = event_registrations.event_id
    JOIN students ON students.id = event_registrations.student_id
    WHERE events.club_id = ?
    ORDER BY event_registrations.registered_at DESC
  `).all(clubId);
}

export function createRegistration(registration) {
  const result = db.prepare(`
    INSERT INTO event_registrations (event_id, student_id, status)
    VALUES (@event_id, @student_id, 'registered')
  `).run(registration);

  return db.prepare('SELECT * FROM event_registrations WHERE id = ?').get(result.lastInsertRowid);
}

export function getRegistrationById(id) {
  return db.prepare(`
    SELECT event_registrations.*, events.club_id
    FROM event_registrations
    JOIN events ON events.id = event_registrations.event_id
    WHERE event_registrations.id = ?
  `).get(id);
}

export function updateRegistrationStatus(id, status) {
  db.prepare('UPDATE event_registrations SET status = ? WHERE id = ?').run(status, id);
  return db.prepare('SELECT * FROM event_registrations WHERE id = ?').get(id);
}

export function deleteRegistration(id) {
  return db.prepare('DELETE FROM event_registrations WHERE id = ?').run(id).changes;
}
