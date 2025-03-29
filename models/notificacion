module.exports = (sequelize, DataTypes) => {
  const Notificacion = sequelize.define('Notificacion', {
    tipo_notificacion: DataTypes.STRING,
    mensaje: DataTypes.TEXT,
    estado_notificacion: {
      type: DataTypes.ENUM('pendiente', 'leída'),
      defaultValue: 'pendiente'
    }
  }, {});

  Notificacion.associate = function(models) {
    Notificacion.belongsTo(models.User, { foreignKey: 'usuario_id' });
  };

  return Notificacion;
};