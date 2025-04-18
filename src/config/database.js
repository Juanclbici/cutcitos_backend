require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cutcitos_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      timezone: '-06:00'
    },
    timezone: '-06:00'
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};