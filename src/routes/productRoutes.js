const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticación
router.use(authMiddleware.verifyToken);

// Rutas públicas


/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Endpoints para gestión de productos públicos y privados (vendedor)
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Obtener detalles de un producto por ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:productId', productController.getProduct);

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: Obtener productos por categoría
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Lista de productos por categoría
 */
router.get('/category/:categoryId', productController.getProductsByCategory);

// Middleware para verificar rol de vendedor
router.use(authMiddleware.checkRole('seller'));

// Rutas de vendedor

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto (solo vendedores)
 *     tags: [Productos]
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
 *               - descripcion
 *               - precio
 *               - cantidad_disponible
 *               - categoria_id
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               cantidad_disponible:
 *                 type: integer
 *               imagen:
 *                 type: string
 *               categoria_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       400:
 *         description: Error en los datos
 *       403:
 *         description: Solo vendedores pueden acceder
 */
router.post('/', productController.createProduct);

/**
 * @swagger
 * /products/vendor/my-products:
 *   get:
 *     summary: Obtener productos del vendedor autenticado
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos del vendedor
 */
router.get('/vendor/my-products', productController.getVendorProducts);

/**
 * @swagger
 * /products/{productId}:
 *   put:
 *     summary: Actualizar un producto (solo vendedor propietario)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               cantidad_disponible:
 *                 type: integer
 *               imagen:
 *                 type: string
 *               categoria_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:productId', productController.updateProduct);

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Eliminar un producto (solo vendedor propietario)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:productId', productController.deleteProduct);


module.exports = router;