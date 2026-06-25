import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import { env } from './env.js';

const options: Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Cutcitos API',
      version: '2.0.0',
      description: 'Cutcitos API Documentation (registration, login, products, orders, etc.)',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Look for both TypeScript and JavaScript files during the migration
  apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
