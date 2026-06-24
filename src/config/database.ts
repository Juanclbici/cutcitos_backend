import { env } from './env';

module.exports = {
  development: {
    username: env.db.user,
    password: env.db.password,
    database: env.db.name,
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      timezone: '-06:00'
    },
    timezone: '-06:00'
  },

  test: {
    username: env.db.user,
    password: env.db.password,
    database: process.env.DB_NAME_TEST || 'cutcitos_test', 
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
    logging: false
  },

  production: {
    username: env.db.user,
    password: env.db.password,
    database: env.db.name,
    host: env.db.host,
    port: env.db.port,
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
