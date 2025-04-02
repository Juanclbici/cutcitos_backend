module.exports = (sequelize, DataTypes) => {
    const Mensaje = sequelize.define('Mensaje', {
      mensaje: DataTypes.TEXT,
      estado_mensaje: {
        type: DataTypes.ENUM('pendiente', 'leído'),
        defaultValue: 'pendiente'
      }
    }, {});
  
    Mensaje.associate = function(models) {
      Mensaje.belongsTo(models.User, { as: 'Comprador', foreignKey: 'usuario_id' });
      Mensaje.belongsTo(models.User, { as: 'Vendedor', foreignKey: 'vendedor_id' });
    };
  
    return Mensaje;
  };