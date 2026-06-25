import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import prisma from './client.js';

const PORT = env.PORT;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connection has been established successfully via Prisma 7.');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();