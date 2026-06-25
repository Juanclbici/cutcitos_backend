import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mysql from 'mysql2/promise'; 
import { PrismaClient } from './generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL || `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = mysql.createPool(connectionString);

const adapter = new PrismaMariaDb(pool as any);

const prisma = new PrismaClient({ adapter });

export default prisma;