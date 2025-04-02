const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  pedido_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'user_id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'producto_id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado_pedido: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'cancelado', 'entregado'),
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
  fecha_confirmacion_vendedor: {
    type: DataTypes.DATE,
    allowNull: true
  },
  venta_realizada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metodo_pago: {
    type: DataTypes.STRING,
    allowNull: true
  },
  direccion_entrega: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'Pedidos'
});

module.exports = Order;