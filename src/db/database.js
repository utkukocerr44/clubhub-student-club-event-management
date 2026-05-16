import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../clubhub.sqlite');

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      president_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      student_number TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      managed_club_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
      FOREIGN KEY (managed_club_id) REFERENCES clubs(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      event_date TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'pending',
      joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (club_id, student_id),
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'registered',
      registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (event_id, student_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  seedData();
}

function seedData() {
  const insertClub = db.prepare(`
    INSERT OR IGNORE INTO clubs (name, category, description, president_name, contact_email)
    VALUES (@name, @category, @description, @president_name, @contact_email)
  `);
  const insertStudent = db.prepare(`
    INSERT OR IGNORE INTO students (full_name, student_number, email, department)
    VALUES (@full_name, @student_number, @email, @department)
  `);
  const insertEvent = db.prepare(`
    INSERT INTO events (club_id, title, description, location, event_date, capacity)
    SELECT @club_id, @title, @description, @location, @event_date, @capacity
    WHERE NOT EXISTS (
      SELECT 1 FROM events WHERE title = @title AND club_id = @club_id
    )
  `);
  const insertMembership = db.prepare(`
    INSERT OR IGNORE INTO memberships (club_id, student_id, role, status)
    VALUES (@club_id, @student_id, @role, @status)
  `);
  const insertRegistration = db.prepare(`
    INSERT OR IGNORE INTO event_registrations (event_id, student_id, status)
    VALUES (@event_id, @student_id, @status)
  `);
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (student_id, full_name, email, password_hash, role, managed_club_id)
    VALUES (@student_id, @full_name, @email, @password_hash, @role, @managed_club_id)
  `);
  const getClubId = db.prepare('SELECT id FROM clubs WHERE name = ?');
  const getStudentId = db.prepare('SELECT id FROM students WHERE student_number = ?');
  const getEventId = db.prepare('SELECT id FROM events WHERE title = ?');

  const clubs = [
    {
      name: 'Arel Software and Technology Club',
      category: 'Technology',
      description: 'Organizes software development workshops, project meetings, and technology talks for Arel students.',
      president_name: 'Kerem Ozkan',
      contact_email: 'softwareclub@istanbularel.edu.tr'
    },
    {
      name: 'Arel Entrepreneurship Club',
      category: 'Career',
      description: 'Brings students together for startup talks, idea development sessions, and networking events.',
      president_name: 'Melis Karaca',
      contact_email: 'entrepreneurshipclub@istanbularel.edu.tr'
    },
    {
      name: 'Arel Cinema and Culture Club',
      category: 'Culture',
      description: 'Hosts film screenings, culture talks, and student discussion sessions.',
      president_name: 'Bora Aksoy',
      contact_email: 'cinemaclub@istanbularel.edu.tr'
    },
    {
      name: 'Arel Sports and Wellness Club',
      category: 'Sports',
      description: 'Plans campus sport activities, wellness sessions, and student tournaments.',
      president_name: 'Derya Tunc',
      contact_email: 'sportsclub@istanbularel.edu.tr'
    },
    {
      name: 'Arel Social Responsibility Club',
      category: 'Social Responsibility',
      description: 'Coordinates volunteer work, donation campaigns, and awareness events on campus.',
      president_name: 'Emirhan Polat',
      contact_email: 'socialresponsibility@istanbularel.edu.tr'
    }
  ];

  const students = [
    {
      full_name: 'Kerem Ozkan',
      student_number: '220303111',
      email: 'kerem.ozkan@istanbularel.edu.tr',
      department: 'Software Engineering'
    },
    {
      full_name: 'Melis Karaca',
      student_number: '220303112',
      email: 'melis.karaca@istanbularel.edu.tr',
      department: 'Computer Engineering'
    },
    {
      full_name: 'Bora Aksoy',
      student_number: '220303113',
      email: 'bora.aksoy@istanbularel.edu.tr',
      department: 'Management Information Systems'
    },
    {
      full_name: 'Derya Tunc',
      student_number: '220303114',
      email: 'derya.tunc@istanbularel.edu.tr',
      department: 'Industrial Engineering'
    },
    {
      full_name: 'Emirhan Polat',
      student_number: '220303115',
      email: 'emirhan.polat@istanbularel.edu.tr',
      department: 'Psychology'
    },
    {
      full_name: 'Nilay Ergin',
      student_number: '220303116',
      email: 'nilay.ergin@istanbularel.edu.tr',
      department: 'Visual Communication Design'
    }
  ];

  clubs.forEach((club) => insertClub.run(club));
  students.forEach((student) => insertStudent.run(student));

  const softwareClubId = getClubId.get('Arel Software and Technology Club').id;
  const entrepreneurshipClubId = getClubId.get('Arel Entrepreneurship Club').id;
  const cinemaClubId = getClubId.get('Arel Cinema and Culture Club').id;
  const sportsClubId = getClubId.get('Arel Sports and Wellness Club').id;
  const responsibilityClubId = getClubId.get('Arel Social Responsibility Club').id;

  const events = [
    {
      club_id: softwareClubId,
      title: 'Web API Workshop',
      description: 'A hands-on workshop about building REST APIs with Node.js and Express.',
      location: 'Arel Kemal Gozukara Campus, B-204',
      event_date: '2026-06-01T14:00:00',
      capacity: 35
    },
    {
      club_id: softwareClubId,
      title: 'Git and GitHub Study Session',
      description: 'A practical session for version control basics and project collaboration workflows.',
      location: 'Arel Computer Laboratory 2',
      event_date: '2026-06-03T15:30:00',
      capacity: 28
    },
    {
      club_id: entrepreneurshipClubId,
      title: 'Startup Idea Pitch Day',
      description: 'Students present project ideas and receive feedback from invited mentors.',
      location: 'Arel Conference Hall',
      event_date: '2026-06-05T13:00:00',
      capacity: 80
    },
    {
      club_id: cinemaClubId,
      title: 'Short Film Screening',
      description: 'Screening and discussion of student-made short films.',
      location: 'Arel Auditorium',
      event_date: '2026-06-07T18:00:00',
      capacity: 90
    },
    {
      club_id: sportsClubId,
      title: 'Campus Volleyball Tournament',
      description: 'A student volleyball tournament organized for club members and guests.',
      location: 'Arel Sports Hall',
      event_date: '2026-06-10T16:00:00',
      capacity: 48
    },
    {
      club_id: responsibilityClubId,
      title: 'Campus Blood Donation Awareness Stand',
      description: 'An awareness stand about blood donation and community support.',
      location: 'Arel Main Entrance Hall',
      event_date: '2026-06-12T11:00:00',
      capacity: 60
    }
  ];

  events.forEach((event) => insertEvent.run(event));

  const keremId = getStudentId.get('220303111').id;
  const melisId = getStudentId.get('220303112').id;
  const boraId = getStudentId.get('220303113').id;
  const deryaId = getStudentId.get('220303114').id;
  const emirhanId = getStudentId.get('220303115').id;
  const nilayId = getStudentId.get('220303116').id;

  [
    { club_id: softwareClubId, student_id: keremId, role: 'president', status: 'approved' },
    { club_id: softwareClubId, student_id: melisId, role: 'member', status: 'approved' },
    { club_id: entrepreneurshipClubId, student_id: deryaId, role: 'member', status: 'approved' },
    { club_id: cinemaClubId, student_id: nilayId, role: 'member', status: 'approved' },
    { club_id: sportsClubId, student_id: boraId, role: 'member', status: 'pending' },
    { club_id: responsibilityClubId, student_id: emirhanId, role: 'president', status: 'approved' }
  ].forEach((membership) => insertMembership.run(membership));

  const webApiWorkshopId = getEventId.get('Web API Workshop').id;
  const pitchDayId = getEventId.get('Startup Idea Pitch Day').id;
  const filmScreeningId = getEventId.get('Short Film Screening').id;

  [
    { event_id: webApiWorkshopId, student_id: keremId, status: 'registered' },
    { event_id: webApiWorkshopId, student_id: melisId, status: 'registered' },
    { event_id: pitchDayId, student_id: deryaId, status: 'registered' },
    { event_id: filmScreeningId, student_id: nilayId, status: 'registered' },
    { event_id: filmScreeningId, student_id: boraId, status: 'registered' }
  ].forEach((registration) => insertRegistration.run(registration));

  const seedPasswordHash = '$2b$10$ZrVgtE681QBr2sS/PP1va..VRccHAClkj7BU2MYqvQ0eUWkrdM/za';

  [
    {
      student_id: null,
      full_name: 'System Admin',
      email: 'admin@istanbularel.edu.tr',
      password_hash: seedPasswordHash,
      role: 'admin',
      managed_club_id: null
    },
    {
      student_id: keremId,
      full_name: 'Kerem Ozkan',
      email: 'kerem.ozkan@istanbularel.edu.tr',
      password_hash: seedPasswordHash,
      role: 'club_manager',
      managed_club_id: softwareClubId
    },
    {
      student_id: melisId,
      full_name: 'Melis Karaca',
      email: 'melis.karaca@istanbularel.edu.tr',
      password_hash: seedPasswordHash,
      role: 'student',
      managed_club_id: null
    }
  ].forEach((user) => insertUser.run(user));
}
