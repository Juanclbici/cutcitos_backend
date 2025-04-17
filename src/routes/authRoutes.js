const express = require('express');
const router = express.Router();
const authController = require('../controllers/userControllers/authController');
const { validateResetRequest, validateResetPassword } = require('../validators/authValidator');
// Ruta para registro de usuarios
router.post('/register', authController.register);

// Ruta para inicio de sesión
router.post('/login', authController.login);

// Solicitud de reset (envío de email)
router.post('/forgot-password', authController.requestPasswordReset);

// 1. Validación del token (GET - cuando hacen clic en el email)
router.get('/reset-password/:token', authController.resetPassword);

// 2. Procesamiento del reset (POST - cuando envían el formulario)
router.post('/reset-password/:token', authController.resetPassword);

// Ruta para validar el código de reseteo
router.post('/validate-reset-code', authController.validateResetCode);

module.exports = router;