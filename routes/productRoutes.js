const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticación
router.use(authMiddleware.verifyToken);

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProduct);
router.get('/category/:categoryId', productController.getProductsByCategory);

// Middleware para verificar rol de vendedor
router.use(authMiddleware.checkRole('seller'));

// Rutas de vendedor
router.post('/', productController.createProduct);
router.get('/vendor/my-products', productController.getVendorProducts);
router.put('/:productId', productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);

module.exports = router;