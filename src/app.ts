import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { logger } from './utils/logger.js';
//const db = require('./models');

// Import routes
/*
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const favoritesRoutes = require('./routes/favoriteRoutes');
const blockchainRoutes = require("./routes/blockchainRoutes.js");
*/
const app = express();

const corsOptions = {
  origin: env.Frontend_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Log each request that arrives at the API
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: [${req.method}] ${req.path}`);
  next();
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
/*
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/blockchain", blockchainRoutes);
*/
// Test route
app.get('/', (req: Request, res: Response) => {
  res.send('Cutcitos API is running successfully');
});

app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server active' });
});

// Global errors
app.use(errorMiddleware);

export default app;


