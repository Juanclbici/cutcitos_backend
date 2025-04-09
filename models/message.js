module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    mensaje_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado_mensaje: {
      type: DataTypes.ENUM('enviado', 'recibido', 'leido'),
      defaultValue: 'enviado'
    }
  });

  Message.associate = function(models) {
    Message.belongsTo(models.User, { 
      as: 'Usuario',
      foreignKey: 'usuario_id' 
    });
    Message.belongsTo(models.User, { 
      as: 'Vendedor',
      foreignKey: 'vendedor_id' 
    });
  };

  return Message;
};