const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  producto_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categorias',
      key: 'categoria_id'
    }
  },
  vendedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'user_id'
    }
  },
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cantidad_vendida: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imagen: {
    type: DataTypes.STRING
  },
  fecha_publicacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado_producto: {
    type: DataTypes.ENUM('disponible', 'agotado'),
    defaultValue: 'disponible'
  }
}, {
  timestamps: false,
  tableName: 'productos'
});
 
module.exports = Product;