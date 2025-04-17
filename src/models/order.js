module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    pedido_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'pedido_id'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'usuario_id'
    },
    vendedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'vendedor_id'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    estado_pedido: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'),
      defaultValue: 'pendiente'
    },
    metodo_pago: {
      type: DataTypes.STRING,
      allowNull: false
    },
    direccion_entrega: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vendedor_confirmado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    venta_realizada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    paranoid: true,
    underscored: true
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, {
      foreignKey: 'usuario_id',
      as: 'Usuario'
    });

    Order.belongsTo(models.User, {
      foreignKey: 'vendedor_id',
      as: 'Vendedor'
    });

    Order.belongsToMany(models.Product, {
      through: models.OrderItem,
      foreignKey: 'order_id',
      otherKey: 'producto_id',
      as: 'Productos'
    });
  };

  return Order;
};