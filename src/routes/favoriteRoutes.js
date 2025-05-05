const express = require ('express');
const router = express.Router();
const favoriteController = require ('../controllers/userControllers/favoriteController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/:productId', favoriteController.addFavorite);
router.delete('/:productId', favoriteController.removeFavorite);
router.get('/', favoriteController.getFavorites);
router.get('/:productId', favoriteController.isFavorite);
router.delete('/'. favoriteController.clearFavorites);

module.exports = router;