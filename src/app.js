const express = require('express');
const cors = require('cors');
const db = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const simpleLogger = require('./middlewares/simpleLogger');
require('dotenv').config();
const morgan = require('morgan');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const favoritesRoutes = require('./routes/favoriteRoutes');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

const morganStream = {
  write: (message) => logger.info(message.trim())
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(simpleLogger);
app.use(morgan('combined', { stream: morganStream }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Prueba
app.get('/', (req, res) => {
  res.send('API de Cutcitos funcionando');
});
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Servidor activo ✅' });
});

// Errores globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

module.exports = app;
