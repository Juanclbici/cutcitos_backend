module.exports = (sequelize, DataTypes) => {
    const Ubicacion = sequelize.define('Ubicacion', {
      ubicacion_actual: DataTypes.GEOMETRY('POINT'),
      categoria: DataTypes.STRING
    }, {});
  
    Ubicacion.associate = function(models) {
      Ubicacion.belongsTo(models.User, { foreignKey: 'vendedor_id' });
    };
  
    return Ubicacion;
  };