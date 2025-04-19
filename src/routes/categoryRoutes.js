const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/productControllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');


// ... otras rutas protegidas
/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: Endpoints para gestionar categorías de productos
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id', categoryController.getCategoryById);

// Rutas protegidas (solo admin)
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole('admin'));
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               imagen:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.post('/', categoryController.createCategory);

module.exports = router;