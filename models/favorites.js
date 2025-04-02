module.exports = (sequelize, DataTypes) => {
    const Favorito = sequelize.define('Favorito', {}, {});
  
    Favorito.associate = function(models) {
      Favorito.belongsTo(models.User, { foreignKey: 'usuario_id' });
      Favorito.belongsTo(models.Producto, { foreignKey: 'producto_id' });
    };
  
    return Favorito;
  };