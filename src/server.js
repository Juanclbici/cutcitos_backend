require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

// Arrancamos directamente
app.listen(PORT, () => {
  console.log(`Servidor Cutcitos corriendo en puerto ${PORT}`);
  console.log(`API URL: ${process.env.API_URL}`);
});
