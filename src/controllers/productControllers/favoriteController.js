const favoriteService = require("../../services/favoriteService");
const logger = require("../../utils/logger");

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const { favorite, created } = await favoriteService.addFavorite(userId, productId);
    logger.info(`Producto ID ${productId} marcado como favorito por usuario ID ${userId}`);
    res.status(created ? 201 : 200).json({ message: 'Producto marcado como favorito' });
  } catch (error) {
    logger.error(`Error al agregar favorito - Usuario: ${req.user.id} - ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const removed = await favoriteService.removeFavorite(userId, productId);
    if (removed) {
      logger.info(`Favorito eliminado - Usuario: ${userId} - Producto: ${productId}`);
      res.json({ message: 'Producto eliminado de favoritos' });
    } else {
      logger.warn(`Intento de eliminar favorito inexistente - Usuario: ${userId} - Producto: ${productId}`);
      res.status(404).json({ error: 'El producto no estaba en favoritos' });
    }
  } catch (error) {
    logger.error(`Error al quitar favorito - Usuario: ${req.user.id} - ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await favoriteService.getUserFavorites(userId);
    logger.info(`Favoritos obtenidos para usuario ID ${userId}`);
    res.json(favorites);
  } catch (error) {
    logger.error(`Error al obtener favoritos - Usuario: ${req.user.id} - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.isFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const isFav = await favoriteService.isFavorite(userId, productId);
    logger.info(`Verificación de favorito - Usuario: ${userId} - Producto: ${productId} - Resultado: ${isFav}`);
    res.json({ isFavorite: isFav });
  } catch (error) {
    logger.error(`Error al verificar favorito - Usuario: ${req.user.id} - ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

exports.clearFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    await favoriteService.clearFavorites(userId);
    logger.info(`Todos los favoritos eliminados para usuario ID ${userId}`);
    res.json({ message: 'Todos los favoritos han sido eliminados' });
  } catch (error) {
    logger.error(`Error al eliminar todos los favoritos - Usuario: ${req.user.id} - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};