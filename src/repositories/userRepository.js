import { db } from '../db/database.js';

export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserById(id) {
  return db.prepare(`
    SELECT id, student_id, full_name, email, role, managed_club_id, created_at
    FROM users
    WHERE id = ?
  `).get(id);
}

export function listUsers() {
  return db.prepare(`
    SELECT id, student_id, full_name, email, role, managed_club_id, created_at
    FROM users
    ORDER BY full_name
  `).all();
}

export function createUser(user) {
  const result = db.prepare(`
    INSERT INTO users (student_id, full_name, email, password_hash, role, managed_club_id)
    VALUES (@student_id, @full_name, @email, @password_hash, @role, @managed_club_id)
  `).run({
    ...user,
    role: user.role || 'student',
    managed_club_id: user.managed_club_id || null
  });

  return getUserById(result.lastInsertRowid);
}
