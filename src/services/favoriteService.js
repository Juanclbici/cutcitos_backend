const db = require('../models');

const favoriteService = {
    async addFavorite(userId, productId) {
      try {
        // Verificar si el producto existe //
        const product = await db.Product.findByPk(productId);
        if (!product) {
          throw new Error('Producto no encontrado');
        }
  
        // Evitar duplicados //
        const [favorite, created] = await db.Favorite.findOrCreate({
          where: { user_id: userId, product_id: productId }
        });
  
        return { favorite, created };
      } catch (error) {
        console.error('Error al agregar favorito:', error);
        throw error;
      }
    },
  
    async removeFavorite(userId, productId) {
      try {
        const deleted = await db.Favorite.destroy({
          where: { user_id: userId, product_id: productId }
        });
  
        return deleted > 0;
      } catch (error) {
        console.error('Error al quitar favorito:', error);
        throw error;
      }
    },

    async getUserFavorites(userId) {
        try {
            const favorite = await db.Favorite.findAll({
                where: { user_id: userId },
                include:[
                    {
                        model: db.Product,
                        as: 'Producto',
                        include: [
                            {
                                model: db.User,
                                as: 'Vendedor',
                                attributes: ['user_id', 'nombre']
                            },
                            {
                                model: db.Category,
                                as: 'Categoria',
                                attributes: ['categoria_id', 'nombre']
                            }
                        ]
                    }
                ]
            });

            return favorite.map(f => f.Producto);
        }   catch (error) {
            console.error('Error al obtener favoritos: ' , error);
            throw error;
        }
    },

    async isFavorite(userId, productId) {
        try{
            const exists = await db.Favorite.findOne({
                where: {user_id: userId, product_id: productId}
            });

            return !!exists;
        }   catch (error) {
            console.error('Error al verificar favorito: ', error);
        }
    },

    async clearFavorites(userId) {
        try {
            await db.Favorite.destroy({
                where: {user_id: userId}
            });
        }   catch (error) {
            console.error('Error al eliminar todos los favoritos: ', error);
            throw error;
        }
    }
};

module.exports = favoriteService;
