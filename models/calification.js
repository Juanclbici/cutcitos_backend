module.exports = (sequelize, DataTypes) => {
  const Calification = sequelize.define('Calification', {
    calificacion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    puntaje: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    comentario: DataTypes.TEXT,
    fecha_calificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    tipo_calificacion: {
      type: DataTypes.ENUM('producto', 'vendedor'),
      allowNull: false
    }
  });

  Calification.associate = function(models) {
    Calification.belongsTo(models.User, { 
      as: 'Usuario',
      foreignKey: 'usuario_id' 
    });
    Calification.belongsTo(models.User, { 
      as: 'Vendedor',
      foreignKey: 'vendedor_id' 
    });
    Calification.belongsTo(models.Product, { foreignKey: 'producto_id' });
  };

  return Calification;
};