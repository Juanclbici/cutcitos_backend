module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado_mensaje: {
      type: DataTypes.ENUM('enviado', 'entregado', 'leído'),
      defaultValue: 'enviado'
    },
    remitente_id: {
      type: DataTypes.INTEGER
    },
    destinatario_id: {
      type: DataTypes.INTEGER
    },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    paranoid: true
  });

  return Message;
};
