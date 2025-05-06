const express = require('express');
const router = express.Router();
const authController = require('../controllers/userControllers/authController');
const { validateResetRequest, validateResetPassword } = require('../validators/authValidator');
const loginLimiter = require('../middlewares/rateLimiter');
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para autenticación de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de nuevos usuarios
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               codigo_UDG:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos o correo ya registrado
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión con correo y contraseña
 *     tags: [Auth]
 *     description: |
 *       Endpoint de inicio de sesión con autenticación JWT.  
 *       Limitado a **5 intentos cada 5 minutos por IP** para evitar ataques de fuerza bruta.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso con token JWT
 *       401:
 *         description: Credenciales incorrectas o cuenta inactiva
 *       429:
 *         description: Demasiadas solicitudes, intenta más tarde
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar reseteo de contraseña (envía email con código)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código enviado al correo
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/forgot-password', authController.requestPasswordReset);


/**
 * @swagger
 * /auth/validate-reset-code:
 *   post:
 *     summary: Validar código de reseteo enviado al correo
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               npassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código válido
 *       400:
 *         description: Código inválido o expirado
 */
router.post('/validate-reset-code', authController.validateResetCode);

module.exports = router;