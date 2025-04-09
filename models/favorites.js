module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    favorito_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fecha_agregado: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  Favorite.associate = function(models) {
    Favorite.belongsTo(models.User, { foreignKey: 'usuario_id' });
    Favorite.belongsTo(models.Product, { foreignKey: 'producto_id' });
  };

  return Favorite;
};