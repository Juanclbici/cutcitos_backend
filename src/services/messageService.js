const db = require('../models');
const { Message } = db;
const { Op } = require('sequelize');

exports.crearMensaje = async ({ mensaje, remitente_id, destinatario_id }) => {
  return await Message.create({
    mensaje,
    remitente_id,
    destinatario_id,
    estado_mensaje: 'enviado',
    fecha_envio: new Date(),
    leido: false
  });
};

exports.obtenerConversacionEntreUsuarios = async (remitenteId, destinatarioId) => {
    // Marcar mensajes como leídos
    await Message.update(
      { leido: true },
      {
        where: {
          remitente_id: remitenteId,
          destinatario_id: destinatarioId,
          leido: false
        }
      }
    );
  
    // Obtener la conversación
    const mensajes = await Message.findAll({
      attributes: ['mensaje', 'fecha_envio', 'estado_mensaje', 'remitente_id', 'destinatario_id'],
      where: {
        [Op.or]: [
          { remitente_id: remitenteId, destinatario_id: destinatarioId },
          { remitente_id: destinatarioId, destinatario_id: remitenteId }
        ]
      },
      order: [["fecha_envio", "ASC"]],
    });
  
    return mensajes;
};

exports.obtenerMensajesDelUsuario = async (userId) => {
  return await Message.findAll({
    attributes: ['mensaje', 'fecha_envio', 'estado_mensaje', 'remitente_id', 'destinatario_id'],
    where: {
      [Op.or]: [
        { remitente_id: userId },
        { destinatario_id: userId }
      ]
    },
    order: [['fecha_envio', 'DESC']]
  });
};

exports.obtenerInboxDelUsuario = async (userId) => {
  const mensajes = await Message.findAll({
    attributes: [
      'mensaje',
      'fecha_envio',
      'estado_mensaje',
      'remitente_id',
      'destinatario_id',
      'leido'
    ],
    where: {
      [Op.or]: [
        { remitente_id: userId },
        { destinatario_id: userId }
      ]
    },
    order: [['fecha_envio', 'DESC']]
  });

  const conversaciones = [];
  const usuariosVistos = new Set();

  for (const msg of mensajes) {
    const otroUsuario = msg.remitente_id === userId
      ? msg.destinatario_id
      : msg.remitente_id;

    if (!usuariosVistos.has(otroUsuario)) {
      usuariosVistos.add(otroUsuario);

      const hayNoLeidos = mensajes.some(m =>
        m.remitente_id === otroUsuario &&
        m.destinatario_id === userId &&
        !m.leido
      );

      conversaciones.push({
        usuario_id: otroUsuario,
        ultimo_mensaje: msg.mensaje,
        fecha: msg.fecha_envio,
        no_leido: hayNoLeidos
      });
    }
  }

  return conversaciones;
};
