module.exports = (sequelize, DataTypes) => {
    const Pedido = sequelize.define('Pedido', {
      cantidad: DataTypes.INTEGER,
      total: DataTypes.FLOAT,
      estado_pedido: {
        type: DataTypes.ENUM('pendiente', 'confirmado', 'cancelado'),
        defaultValue: 'pendiente'
      },
      vendedor_confirmado: { type: DataTypes.BOOLEAN, defaultValue: false },
      venta_realizada: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {});
  
    Pedido.associate = function(models) {
      Pedido.belongsTo(models.User, { foreignKey: 'usuario_id' });
      Pedido.belongsTo(models.Producto, { foreignKey: 'producto_id' });
    };
  
    return Pedido;
  };