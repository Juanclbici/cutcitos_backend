const favoriteService = require("../../services/favoriteService");

exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const { favorite, created } = await favoriteService.addFavorite(userId, productId);
        res.status(created ? 201 : 200).json({ message: 'Producto marcado como favorito'});
    }   catch (error) {
        res.status(400).json({error: error.message});
    }
};

exports.removeFavorite = async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
  
      const removed = await favoriteService.removeFavorite(userId, productId);
      if (removed) {
        res.json({ message: 'Producto eliminado de favoritos' });
      } else {
        res.status(404).json({ error: 'El producto no estaba en favoritos' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

exports.getFvorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const favorites = await favoriteService.getUserFavorites(userId);
        res.json(favorites);
    }   catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.isFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const isFav = await favoriteService.isFavorite(userId, productId);
        res.json({ isFavorite: isFav});
    }   catch (error){
        res.status(400).json({ error: error.message});
    }
};

exports.clearFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        await favoriteService.clearFavorites(userId);
        res.json({ message: 'Todos los favoritos han sido eliminados' });
    }   catch (error) {
        res.status(500).json({ error: error.message });
    }
};