import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { initializeDatabase } from './db/database.js';
import { errorHandler } from './middleware.js';
import { clubsRouter } from './routes/clubs.js';
import { dashboardRouter } from './routes/dashboard.js';
import { eventsRouter } from './routes/events.js';
import { membershipsRouter } from './routes/memberships.js';
import { registrationsRouter } from './routes/registrations.js';
import { studentsRouter } from './routes/students.js';

const app = express();
const port = process.env.PORT || 3000;

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/clubs', clubsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/memberships', membershipsRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ClubHub API' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`ClubHub is running on http://localhost:${port}`);
  console.log(`Swagger UI is available on http://localhost:${port}/api-docs`);
});
