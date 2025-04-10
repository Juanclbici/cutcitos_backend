const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticación
router.use(authMiddleware.verifyToken);

// Rutas para estudiantes
router.post('/', orderController.createOrder);
router.get('/history', orderController.getOrderHistory);
router.put('/:pedidoId/cancel', orderController.cancelOrder);

// Middleware para verificar rol de vendedor
router.use(authMiddleware.checkRole('seller'));

// Rutas para vendedores
router.put('/:pedidoId/confirm', orderController.confirmOrder);
router.get('/vendor', orderController.getVendorOrders);
router.put('/:pedidoId/deliver', orderController.markAsDelivered);
router.get('/reports', orderController.getSalesReports);

module.exports = router;