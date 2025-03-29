module.exports = (sequelize, DataTypes) => {
    const Producto = sequelize.define('Producto', {
      nombre: DataTypes.STRING,
      descripcion: DataTypes.TEXT,
      precio: DataTypes.FLOAT,
      cantidad_disponible: DataTypes.INTEGER,
      cantidad_vendida: { type: DataTypes.INTEGER, defaultValue: 0 },
      imagen: DataTypes.STRING,
      estado_producto: { 
        type: DataTypes.ENUM('disponible', 'agotado'),
        defaultValue: 'disponible'
      }
    }, {});
  
    Producto.associate = function(models) {
      Producto.belongsTo(models.Categoria, { foreignKey: 'categoria_id' });
      Producto.belongsTo(models.User, { 
        as: 'Vendedor',
        foreignKey: 'vendedor_id'
      });
    };
  
    return Producto;
  };