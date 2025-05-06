const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config(); // Asegura cargar variables de entorno

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const configPath = path.join(__dirname, '..', 'config', 'database.js');
const config = require(configPath)[env]; // Carga la config según el entorno

const db = {};

let sequelize;

if (env === 'production' && config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      dialect: config.dialect,
      logging: config.logging,
      dialectOptions: config.dialectOptions || {},
      define: {
        timestamps: true,
        paranoid: true,
        underscored: true
      }
    }
  );
}

db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);

// Cargar modelos automáticamente
fs.readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  ))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exportar conexión y modelos
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Hooks globales de timestamp local
sequelize.addHook('beforeCreate', (instance) => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  if (instance.dataValues.createdAt) {
    instance.dataValues.createdAt = localTime;
  }
  if (instance.dataValues.updatedAt) {
    instance.dataValues.updatedAt = localTime;
  }
});

sequelize.addHook('beforeUpdate', (instance) => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  if (instance.dataValues.updatedAt) {
    instance.dataValues.updatedAt = localTime;
  }
});

module.exports = db;