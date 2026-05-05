const app = require('./app');
const db = require('./models');


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log('Conexión a la base de datos establecida.');
});
