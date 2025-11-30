const { Notification } = require('../models');

// Notificaciones no leídas
exports.contarNoLeidas = async (usuario_id) => {
  return await Notification.count({
    where: {
      usuario_id,
      estado_notificacion: 'no_leida'
    }
  });
};
