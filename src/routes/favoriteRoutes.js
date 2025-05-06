const express = require ('express');
const router = express.Router();
const favoriteController = require('../controllers/productControllers/favoriteController');
const authMiddleware = require('../middlewares/authMiddleware');
const { verifyToken } = require('../services/authService');

router.use(verifyToken);

router.post('/:productId', favoriteController.addFavorite);
router.delete('/:productId', favoriteController.removeFavorite);
router.get('/', favoriteController.getFavorites);
router.get('/:productId', favoriteController.isFavorite);
router.delete('/', favoriteController.clearFavorites);

module.exports = router;