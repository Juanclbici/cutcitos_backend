module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    favorito_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_agregado: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Favorites',
    timestamps: false
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'Usuario'
    });
    Favorite.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'Producto'
    });
  };

  return Favorite;
};
