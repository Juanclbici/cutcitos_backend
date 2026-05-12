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
        url: "/api", 
        description: 'Servidor en la Nube (ALB)',
      },
      {
        url: "http://localhost:3000/api",
        description: 'Servidor Local',
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
