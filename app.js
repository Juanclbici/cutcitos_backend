const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Inicializar la aplicación
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Cutcitos funcionando');
});

// Sincronizar con la base de datos y arrancar el servidor
const PORT = process.env.PORT;

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });