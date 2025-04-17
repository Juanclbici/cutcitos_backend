module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    notificacion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo_notificacion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado_notificacion: {
      type: DataTypes.ENUM('no_leida', 'leida'),
      defaultValue: 'no_leida'
    }
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.User, { foreignKey: 'usuario_id' });
  };

  return Notification;
};