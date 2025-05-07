const db = require('../models');
const logger = require('../utils/logger');

const favoriteService = {
  async addFavorite(userId, productId) {
    try {
      const product = await db.Product.findByPk(productId);
      if (!product) {
        logger.warn(`Producto no encontrado - ID: ${productId}`);
        throw new Error('Producto no encontrado');
      }

      const [favorite, created] = await db.Favorite.findOrCreate({
        where: { user_id: userId, product_id: productId }
      });

      logger.info(`Favorito ${created ? 'creado' : 'ya existente'} - Usuario: ${userId} - Producto: ${productId}`);
      return { favorite, created };
    } catch (error) {
      logger.error(`Error al agregar favorito: ${error.message}`);
      throw error;
    }
  },

  async removeFavorite(userId, productId) {
    try {
      const deleted = await db.Favorite.destroy({
        where: { user_id: userId, product_id: productId }
      });

      logger.info(`Favorito eliminado (${deleted > 0}) - Usuario: ${userId} - Producto: ${productId}`);
      return deleted > 0;
    } catch (error) {
      logger.error(`Error al quitar favorito: ${error.message}`);
      throw error;
    }
  },

  async getUserFavorites(userId) {
    try {
      const favorites = await db.Favorite.findAll({
        where: { user_id: userId },
        include: [
          {
            model: db.Product,
            as: 'Producto',
            include: [
              { model: db.User, as: 'Vendedor', attributes: ['user_id', 'nombre'] },
              { model: db.Category, as: 'Categoria', attributes: ['categoria_id', 'nombre'] }
            ]
          }
        ]
      });

      logger.info(`Consulta de favoritos - Usuario: ${userId} - Total: ${favorites.length}`);
      return favorites.map(f => f.Producto);
    } catch (error) {
      logger.error(`Error al obtener favoritos: ${error.message}`);
      throw error;
    }
  },

  async isFavorite(userId, productId) {
    try {
      const exists = await db.Favorite.findOne({
        where: { user_id: userId, product_id: productId }
      });

      return !!exists;
    } catch (error) {
      logger.error(`Error al verificar favorito: ${error.message}`);
      throw error;
    }
  },

  async clearFavorites(userId) {
    try {
      const removed = await db.Favorite.destroy({ where: { user_id: userId } });
      logger.info(`Favoritos eliminados en total: ${removed} - Usuario ID: ${userId}`);
    } catch (error) {
      logger.error(`Error al eliminar todos los favoritos: ${error.message}`);
      throw error;
    }
  }
};

module.exports = favoriteService;