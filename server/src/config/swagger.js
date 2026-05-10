import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Traveloop API',
      version: '1.0.0',
      description: 'API documentation for Traveloop travel planning platform',
      contact: {
        name: 'Traveloop Team'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            phone: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            bio: { type: 'string' },
            avatarUrl: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            isPublicProfile: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Trip: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            coverPhotoUrl: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['draft', 'planned', 'ongoing', 'completed'] },
            isPublic: { type: 'boolean' },
            totalBudget: { type: 'number' },
            currency: { type: 'string' }
          }
        },
        City: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            country: { type: 'string' },
            region: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            imageUrl: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            costMin: { type: 'number' },
            costMax: { type: 'number' },
            durationHrs: { type: 'number' },
            imageUrl: { type: 'string' },
            rating: { type: 'number' }
          }
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tripId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['passport', 'visa', 'ticket', 'hotel_confirmation', 'insurance', 'other'] },
            name: { type: 'string' },
            url: { type: 'string' },
            size: { type: 'integer' },
            mimeType: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Trips', description: 'Trip planning' },
      { name: 'Cities', description: 'City information' },
      { name: 'Activities', description: 'Activity management' },
      { name: 'Documents', description: 'Trip document storage' },
      { name: 'Currency', description: 'Currency conversion' },
      { name: 'Collaboration', description: 'Real-time collaboration' },
      { name: 'Community', description: 'Community posts and interactions' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Traveloop API Documentation'
  }));

  // Serve raw OpenAPI spec
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

export default specs;
