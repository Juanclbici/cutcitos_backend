const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas
router.use(authMiddleware.verifyToken);

// Obtener perfil de usuario
router.get('/profile', userController.getUserProfile);

// Actualizar perfil de usuario
router.put('/profile', userController.updateUserProfile);

module.exports = router;