import { db } from '../db/database.js';

export function listStudents() {
  return db.prepare('SELECT * FROM students ORDER BY full_name').all();
}

export function getStudentById(id) {
  return db.prepare('SELECT * FROM students WHERE id = ?').get(id);
}

export function createStudent(student) {
  const result = db.prepare(`
    INSERT INTO students (full_name, student_number, email, department)
    VALUES (@full_name, @student_number, @email, @department)
  `).run(student);

  return getStudentById(result.lastInsertRowid);
}

export function updateStudent(id, student) {
  db.prepare(`
    UPDATE students
    SET full_name = @full_name,
        student_number = @student_number,
        email = @email,
        department = @department
    WHERE id = @id
  `).run({ ...student, id });

  return getStudentById(id);
}

export function deleteStudent(id) {
  return db.prepare('DELETE FROM students WHERE id = ?').run(id).changes;
}
