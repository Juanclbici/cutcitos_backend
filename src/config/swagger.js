const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Cutcitos API',
      version: '1.0.0',
      description: 'Documentación de la API de Cutcitos (registro, login, productos, pedidos, etc.)',
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor Actual',
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
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
