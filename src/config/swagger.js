import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClubHub API',
      version: '1.0.0',
      description: 'REST API for managing university clubs, events, memberships, and event registrations.'
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'Auth' },
      { name: 'Clubs' },
      { name: 'Students' },
      { name: 'Events' },
      { name: 'Memberships' },
      { name: 'Registrations' },
      { name: 'Dashboard' },
      { name: 'Users' }
    ],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Club: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Software Development Club' },
            category: { type: 'string', example: 'Technology' },
            description: { type: 'string', example: 'Coding workshops and project nights.' },
            president_name: { type: 'string', example: 'Kerem Ozkan' },
            contact_email: { type: 'string', example: 'software.club@istanbularel.edu.tr' },
            status: { type: 'string', example: 'active' }
          }
        },
        Student: {
          type: 'object',
          properties: {
            full_name: { type: 'string', example: 'Melis Karaca' },
            student_number: { type: 'string', example: '220303111' },
            email: { type: 'string', example: 'melis.karaca@istanbularel.edu.tr' },
            department: { type: 'string', example: 'Software Engineering' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            club_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Intro to Backend APIs' },
            description: { type: 'string', example: 'A practical REST API session.' },
            location: { type: 'string', example: 'B-204' },
            event_date: { type: 'string', example: '2026-06-01T14:00:00' },
            capacity: { type: 'integer', example: 30 },
            status: { type: 'string', example: 'scheduled' }
          }
        }
      }
    },
    paths: {
      '/api/clubs': {
        get: { tags: ['Clubs'], summary: 'List clubs', responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Clubs'],
          summary: 'Create club',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Club' } } }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/clubs/discover': {
        get: {
          tags: ['Clubs'],
          summary: 'List active clubs for membership requests',
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/clubs/{id}': {
        get: { tags: ['Clubs'], summary: 'Get club by id', parameters: [idParam()], responses: { 200: { description: 'OK' } } },
        put: {
          tags: ['Clubs'],
          summary: 'Update club',
          parameters: [idParam()],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Club' } } } },
          responses: { 200: { description: 'OK' } }
        },
        delete: { tags: ['Clubs'], summary: 'Delete club', parameters: [idParam()], responses: { 204: { description: 'Deleted' } } }
      },
      '/api/students': {
        get: { tags: ['Students'], summary: 'List students', responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Students'],
          summary: 'Create student',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/students/{id}': {
        get: { tags: ['Students'], summary: 'Get student by id', parameters: [idParam()], responses: { 200: { description: 'OK' } } },
        put: {
          tags: ['Students'],
          summary: 'Update student',
          parameters: [idParam()],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
          responses: { 200: { description: 'OK' } }
        },
        delete: { tags: ['Students'], summary: 'Delete student', parameters: [idParam()], responses: { 204: { description: 'Deleted' } } }
      },
      '/api/events': {
        get: { tags: ['Events'], summary: 'List events', responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Events'],
          summary: 'Create event',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/events/{id}': {
        get: { tags: ['Events'], summary: 'Get event by id', parameters: [idParam()], responses: { 200: { description: 'OK' } } },
        put: {
          tags: ['Events'],
          summary: 'Update event',
          parameters: [idParam()],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } },
          responses: { 200: { description: 'OK' } }
        },
        delete: { tags: ['Events'], summary: 'Delete event', parameters: [idParam()], responses: { 204: { description: 'Deleted' } } }
      },
      '/api/memberships': {
        get: { tags: ['Memberships'], summary: 'List memberships', responses: { 200: { description: 'OK' } } },
        post: { tags: ['Memberships'], summary: 'Create membership', responses: { 201: { description: 'Created' } } }
      },
      '/api/memberships/{id}/status': {
        patch: { tags: ['Memberships'], summary: 'Update membership status', parameters: [idParam()], responses: { 200: { description: 'OK' } } }
      },
      '/api/registrations': {
        get: { tags: ['Registrations'], summary: 'List event registrations', responses: { 200: { description: 'OK' } } },
        post: { tags: ['Registrations'], summary: 'Register a student for an event', responses: { 201: { description: 'Created' } } }
      },
      '/api/registrations/{id}/status': {
        patch: { tags: ['Registrations'], summary: 'Update registration status', parameters: [idParam()], responses: { 200: { description: 'OK' } } }
      },
      '/api/dashboard': {
        get: { tags: ['Dashboard'], summary: 'Get dashboard metrics', responses: { 200: { description: 'OK' } } }
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a student account',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['full_name', 'student_number', 'email', 'department', 'password'],
                  properties: {
                    full_name: { type: 'string', example: 'Melis Karaca' },
                    student_number: { type: 'string', example: '220303111' },
                    email: { type: 'string', example: 'melis.karaca@istanbularel.edu.tr' },
                    department: { type: 'string', example: 'Software Engineering' },
                    password: { type: 'string', example: 'clubhub123' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive a JWT',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@istanbularel.edu.tr' },
                    password: { type: 'string', example: 'clubhub123' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/auth/me': {
        get: { tags: ['Auth'], summary: 'Get the authenticated user', responses: { 200: { description: 'OK' } } }
      },
      '/api/users': {
        get: { tags: ['Users'], summary: 'List users', responses: { 200: { description: 'OK' } } }
      }
    }
  },
  apis: ['./src/routes/*.js']
});

function idParam() {
  return {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'integer' }
  };
}
