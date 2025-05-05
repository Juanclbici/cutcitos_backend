module.exports = (sequelize, DataTypes) => {
    const Favorite = sequelize.define('Favorite', {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'favorites',
      timestamps: false
    });

    Favorite,associate = (models) => {
        Favorite,belongsTo(models.User, { foreingKey: 'user_id' });
        Favorite.belongsTo(models,Product, { foreingKey: 'product_id', as: 'Producto' });
    };

    return Favorite;
};