module.exports = (sequelize, DataTypes) => {
    const Calificacion = sequelize.define('Calificacion', {
      puntaje: DataTypes.INTEGER,
      comentario: DataTypes.TEXT,
      tipo_calificacion: DataTypes.ENUM('producto', 'vendedor')
    }, {});
  
    Calificacion.associate = function(models) {
      Calificacion.belongsTo(models.User, { foreignKey: 'usuario_id' });
      Calificacion.belongsTo(models.Producto, { 
        foreignKey: 'producto_id',
        constraints: false 
      });
      Calificacion.belongsTo(models.User, { 
        as: 'Vendedor',
        foreignKey: 'vendedor_id',
        constraints: false
      });
    };
  
    return Calificacion;
  };