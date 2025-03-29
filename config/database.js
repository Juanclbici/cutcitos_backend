const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  };
  
  const sequelize = new Sequelize(dbConfig);

module.exports = sequelize;