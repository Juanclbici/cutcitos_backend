import dotenv from 'dotenv';
import path from 'path';

// Detect type of enviroment(development, production, test)
const environment = process.env.NODE_ENV || 'development';

// Load file .env from main folder
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${environment}`)
});

// Get values .env
const requiredEnvVariables = [
  'PORT',
  'MYSQL_HOST',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE',
  'MYSQL_PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

// Validate one by one
for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    if (environment === 'production') {
      throw new Error('CRITICAL ERROR: Server configuration failure.');
    } 
    else {
      throw new Error(`CRITICAL ERROR: Environment variable '${variable}' is not defined in .env.${environment}`);
    }
  }
}

// Export a Typescript object 
export const env = {
  NODE_ENV: environment,
  PORT: parseInt(process.env.PORT!, 10),
  db: {
    host: process.env.MYSQL_HOST!,
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    name: process.env.MYSQL_DATABASE!,
    port: parseInt(process.env.MYSQL_PORT!, 10),
    url: process.env.DATABASE_URL,
  },
  JWT_Secret: process.env.JWT_SECRET!,
  email: {
    user: process.env.EMAIL_USER!,
    password: process.env.EMAIL_PASS!,
    from: process.env.EMAIL_FROM!,
  },
  Frontend_URL: process.env.FRONTEND_URL!,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    key: process.env.CLOUDINARY_API_KEY!,
    secret: process.env.CLOUDINARY_API_SECRET!,
  },
};