const express = require ('express');
const router = express.Router();
const favoriteController = require('../controllers/productControllers/favoriteController');
const authMiddleware = require('../middlewares/authMiddleware');
const { verifyToken } = require('../services/authService');

router.use(authMiddleware.verifyToken);

/**
 * @swagger
 * tags:
 *   name: Favoritos
 *   description: Operaciones sobre los productos favoritos del usuario
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Obtener todos los productos favoritos del usuario autenticado
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos favoritos
 *       401:
 *         description: No autorizado
 */
router.get('/', favoriteController.getFavorites);

/**
 * @swagger
 * /favorites/{productId}:
 *   get:
 *     summary: Verificar si un producto está en favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Estado de favorito (true o false)
 *       401:
 *         description: No autorizado
 */
router.get('/:productId', favoriteController.isFavorite);

/**
 * @swagger
 * /favorites/{productId}:
 *   post:
 *     summary: Agregar un producto a favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a agregar
 *     responses:
 *       201:
 *         description: Producto agregado a favoritos
 *       400:
 *         description: Error al agregar
 *       401:
 *         description: No autorizado
 */
router.post('/:productId', favoriteController.addFavorite);

/**
 * @swagger
 * /favorites/{productId}:
 *   delete:
 *     summary: Eliminar un producto de favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado de favoritos
 *       400:
 *         description: Error al eliminar
 *       401:
 *         description: No autorizado
 */
router.delete('/:productId', favoriteController.removeFavorite);

/**
 * @swagger
 * /favorites:
 *   delete:
 *     summary: Eliminar todos los productos favoritos del usuario
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los favoritos eliminados
 *       401:
 *         description: No autorizado
 */
router.delete('/', favoriteController.clearFavorites);

module.exports = router;
