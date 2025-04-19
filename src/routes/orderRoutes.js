const express = require('express');
const router = express.Router();
const orderController = require('../controllers/productControllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticación
router.use(authMiddleware.verifyToken);

// Rutas para estudiantes

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Endpoints para gestionar pedidos de estudiantes y vendedores
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - producto_id
 *               - cantidad
 *               - metodo_pago
 *               - direccion_entrega
 *             properties:
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *               metodo_pago:
 *                 type: string
 *               direccion_entrega:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /orders/history:
 *   get:
 *     summary: Obtener historial de pedidos del estudiante
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos del usuario autenticado
 *       401:
 *         description: No autorizado
 */
router.get('/history', orderController.getOrderHistory);

/**
 * @swagger
 * /orders/{pedidoId}/cancel:
 *   put:
 *     summary: Cancelar un pedido como comprador o vendedor
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido a cancelar
 *     responses:
 *       200:
 *         description: Pedido cancelado correctamente
 *       403:
 *         description: No autorizado para cancelar este pedido
 */
router.put('/:pedidoId/cancel', orderController.cancelOrder);

// Middleware para verificar rol de vendedor
router.use(authMiddleware.checkRole('seller'));

//rutas para vendedores

/**
 * @swagger
 * /orders/{pedidoId}/confirm:
 *   put:
 *     summary: Confirmar un pedido como vendedor
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido a confirmar
 *     responses:
 *       200:
 *         description: Pedido confirmado exitosamente
 *       400:
 *         description: Pedido ya confirmado o no válido
 *       403:
 *         description: Solo vendedores pueden confirmar pedidos
 */
router.put('/:pedidoId/confirm', orderController.confirmOrder);

/**
 * @swagger
 * /orders/vendor:
 *   get:
 *     summary: Obtener todos los pedidos del vendedor autenticado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos por vendedor
 *       403:
 *         description: Acceso denegado
 */
router.get('/vendor', orderController.getVendorOrders);

/**
 * @swagger
 * /orders/{pedidoId}/deliver:
 *   put:
 *     summary: Marcar un pedido como entregado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido marcado como entregado
 *       403:
 *         description: Solo vendedores pueden marcar como entregado
 */
router.put('/:pedidoId/deliver', orderController.markAsDelivered);


module.exports = router;