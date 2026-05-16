import { db } from '../db/database.js';

export function listMemberships() {
  return db.prepare(`
    SELECT memberships.*, clubs.name AS club_name, students.full_name AS student_name
    FROM memberships
    JOIN clubs ON clubs.id = memberships.club_id
    JOIN students ON students.id = memberships.student_id
    ORDER BY memberships.joined_at DESC
  `).all();
}

export function listMembershipsForStudent(studentId) {
  return db.prepare(`
    SELECT memberships.*, clubs.name AS club_name, students.full_name AS student_name
    FROM memberships
    JOIN clubs ON clubs.id = memberships.club_id
    JOIN students ON students.id = memberships.student_id
    WHERE memberships.student_id = ?
    ORDER BY memberships.joined_at DESC
  `).all(studentId);
}

export function listMembershipsForClub(clubId) {
  return db.prepare(`
    SELECT memberships.*, clubs.name AS club_name, students.full_name AS student_name
    FROM memberships
    JOIN clubs ON clubs.id = memberships.club_id
    JOIN students ON students.id = memberships.student_id
    WHERE memberships.club_id = ?
    ORDER BY memberships.joined_at DESC
  `).all(clubId);
}

export function createMembership(membership) {
  const result = db.prepare(`
    INSERT INTO memberships (club_id, student_id, role, status)
    VALUES (@club_id, @student_id, @role, @status)
  `).run({
    club_id: membership.club_id,
    student_id: membership.student_id,
    role: membership.role || 'member',
    status: membership.status || 'pending'
  });

  return db.prepare('SELECT * FROM memberships WHERE id = ?').get(result.lastInsertRowid);
}

export function getMembershipById(id) {
  return db.prepare('SELECT * FROM memberships WHERE id = ?').get(id);
}

export function updateMembershipStatus(id, status) {
  db.prepare('UPDATE memberships SET status = ? WHERE id = ?').run(status, id);
  return db.prepare('SELECT * FROM memberships WHERE id = ?').get(id);
}

export function deleteMembership(id) {
  return db.prepare('DELETE FROM memberships WHERE id = ?').run(id).changes;
}
