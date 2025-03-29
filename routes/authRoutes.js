const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateResetRequest, validateResetPassword } = require('../validators/authValidator');
// Ruta para registro de usuarios
router.post('/register', authController.register);

// Ruta para inicio de sesión
router.post('/login', authController.login);

// Ruta para solicitar cambio de password
router.post('/forgot-password', authController.requestPasswordReset);

// Ruta para resetear el usuario
router.post('/reset-password/:token', authController.resetPassword);


module.exports = router;