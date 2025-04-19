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
        url: 'http://localhost:3000/api',
        description: 'Servidor local',
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
  apis: ['./src/routes/*.js'], // Ajusta si tus rutas están en subcarpetas
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
