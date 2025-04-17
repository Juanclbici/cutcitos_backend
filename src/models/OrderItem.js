module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'order_items',
      timestamps: false
    });
  
    OrderItem.associate = function(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'Orden'
      });
  
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'producto_id',
        as: 'Producto'
      });
    };
  
    return OrderItem;
  };
  