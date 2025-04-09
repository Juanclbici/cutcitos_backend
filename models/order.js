module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    pedido_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado_pedido: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'),
      defaultValue: 'pendiente'
    },
    fecha_pedido: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    vendedor_confirmado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fecha_confirmacion_vendedor: DataTypes.DATE,
    venta_realizada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metodo_pago: DataTypes.STRING,
    direccion_entrega: DataTypes.STRING
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'usuario_id' });
    Order.belongsTo(models.Product, { foreignKey: 'producto_id' });
  };

  return Order;
};