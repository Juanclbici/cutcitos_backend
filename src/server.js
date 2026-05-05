const app = require('./app');
const db = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Quitamos el .sync() para evitar el error de Duplicate Foreign Key
app.listen(PORT, () => {
  console.log(`Servidor corriendo`);
});
