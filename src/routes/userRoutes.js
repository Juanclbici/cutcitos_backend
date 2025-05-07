const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas
router.use(authMiddleware.verifyToken);

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones relacionadas con el perfil de usuario y vendedores
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/profile', userController.getUserProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               codigo_UDG:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Error en la actualización
 *       401:
 *         description: No autorizado
 */
router.put('/profile', userController.updateUserProfile);

/**
 * @swagger
 * /users/sellers:
 *   get:
 *     summary: Obtener todos los usuarios con rol de vendedor
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vendedores
 *       401:
 *         description: No autorizado
 */
router.get('/sellers', userController.getSellers);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (para bandeja de entrada)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autorizado
 */
router.get('/', userController.getAllUsers);

module.exports = router;