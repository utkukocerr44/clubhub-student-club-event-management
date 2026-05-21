# ClubHub

ClubHub is a web-based Student Club and Event Management System developed for the System Analysis and Design course project. The system helps university clubs manage club records, student members, events, and participant registrations through a RESTful CRUD application.

## Project Scope

The system provides:

- A RESTful API for club, student, event, membership, and registration operations
- A vanilla JavaScript single-page frontend
- SQLite database persistence
- Input validation on both frontend forms and backend routes
- Business logic separated from routes for unit testing
- Swagger UI for interactive API documentation
- JWT-based authentication and role-based authorization

## Technologies

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js with Express
- Database: SQLite through Node.js built-in `node:sqlite`
- API Documentation: Swagger UI
- Testing: Node.js built-in test runner

## Main Entities

- `Club`: Student club information, category, president, and contact email
- `Student`: Student identity and department information
- `Event`: Club event details, date, location, capacity, and status
- `Membership`: Relationship between students and clubs
- `EventRegistration`: Relationship between students and events
- `User`: Login account with `student`, `club_manager`, or `admin` role

## Business Rules

- Event dates must be valid future dates when creating new scheduled events.
- Event capacity must be a positive integer.
- A student cannot register for the same event twice.
- Students cannot register for cancelled or completed events.
- Students cannot register when event capacity is full.
- Membership status must be `pending`, `approved`, or `rejected`.
- Event status must be `scheduled`, `cancelled`, or `completed`.
- Students can only view clubs connected to their own approved memberships.
- Club managers can only manage events, memberships, and registrations for their assigned club.
- Admin users can view and manage all records.
- Register validation requires an `@istanbularel.edu.tr` email address, a 9 digit student number, and a department from the allowed list.

## Setup

Install dependencies:

```bash
npm install
```

This project expects Node.js 24 or newer because it uses the built-in SQLite module.

Start the application:

```bash
npm start
```

Open the application:

```text
http://localhost:3000
```

Open Swagger API documentation:

```text
http://localhost:3000/api-docs
```

## Demo Accounts

After the database is created, these seeded accounts are available:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@istanbularel.edu.tr` | `clubhub123` |
| Club Manager | `kerem.ozkan@istanbularel.edu.tr` | `clubhub123` |
| Student | `melis.karaca@istanbularel.edu.tr` | `clubhub123` |

## Testing

Run unit tests:

```bash
npm test
```

The tests focus on business logic functions instead of route behavior, matching the project requirement that business logic should be separated and unit tested.

## Linting

Run the basic JavaScript linter:

```bash
npm run lint
```

The linter checks the backend, frontend JavaScript, tests, and ESLint configuration for common JavaScript issues.

## GitHub Actions

The project includes a basic CI workflow in `.github/workflows/ci.yml`. When code is pushed to the `main` branch or a pull request is opened, GitHub Actions installs dependencies, runs unit tests, and runs the linter.

## API Endpoints

### Clubs

- `GET /api/clubs`
- `GET /api/clubs/:id`
- `POST /api/clubs`
- `PUT /api/clubs/:id`
- `DELETE /api/clubs/:id`

### Students

- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

### Events

- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Memberships

- `GET /api/memberships`
- `POST /api/memberships`
- `PATCH /api/memberships/:id/status`
- `DELETE /api/memberships/:id`

### Event Registrations

- `GET /api/registrations`
- `POST /api/registrations`
- `PATCH /api/registrations/:id/status`
- `DELETE /api/registrations/:id`

### Dashboard

- `GET /api/dashboard`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users` admin only

## Project Idea Summary

This project is designed around a realistic university scenario. Student clubs commonly organize workshops, seminars, trips, and social events. ClubHub makes these processes easier to manage by keeping club, event, member, and registration data in a structured system.
