// scripts/init-test-db.js
require('dotenv').config({ path: '.env.test' });

const db = require('../src/models');

async function initTestDB() {
  try {
    await db.sequelize.drop();
    await db.sequelize.sync({ force: true });
    console.log('✔ Tablas creadas en la base de datos de prueba');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la BD de prueba:', error);
    process.exit(1);
  }
}

initTestDB();
