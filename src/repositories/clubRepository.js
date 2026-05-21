import { db } from '../db/database.js';

export function listClubs() {
  return db.prepare('SELECT * FROM clubs ORDER BY name').all();
}

export function listActiveClubs() {
  return db.prepare("SELECT * FROM clubs WHERE status = 'active' ORDER BY name").all();
}

export function listClubsForStudent(studentId) {
  return db.prepare(`
    SELECT clubs.*
    FROM clubs
    JOIN memberships ON memberships.club_id = clubs.id
    WHERE memberships.student_id = ?
      AND memberships.status = 'approved'
    ORDER BY clubs.name
  `).all(studentId);
}

export function getClubById(id) {
  return db.prepare('SELECT * FROM clubs WHERE id = ?').get(id);
}

export function createClub(club) {
  const result = db.prepare(`
    INSERT INTO clubs (name, category, description, president_name, contact_email, status)
    VALUES (@name, @category, @description, @president_name, @contact_email, @status)
  `).run({ ...club, status: club.status || 'active' });

  return getClubById(result.lastInsertRowid);
}

export function updateClub(id, club) {
  db.prepare(`
    UPDATE clubs
    SET name = @name,
        category = @category,
        description = @description,
        president_name = @president_name,
        contact_email = @contact_email,
        status = @status
    WHERE id = @id
  `).run({ ...club, id, status: club.status || 'active' });

  return getClubById(id);
}

export function deleteClub(id) {
  return db.prepare('DELETE FROM clubs WHERE id = ?').run(id).changes;
}
