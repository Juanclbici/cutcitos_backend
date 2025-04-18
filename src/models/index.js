const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Cargar configuración de la base de datos
const configPath = path.join(__dirname, '..', 'config', 'database.js');
const config = require(configPath)[env];

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
        paranoid: true, // Para soft delete
        underscored: true // snake_case en lugar de camelCase
      }
    }
  );
}

// Cargar modelos
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Establecer asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
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