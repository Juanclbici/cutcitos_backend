const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById); 

// Rutas protegidas (solo admin)
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole('admin'));

router.post('/', categoryController.createCategory);
// ... otras rutas protegidas

module.exports = router;