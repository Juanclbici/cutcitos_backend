const db = require('../models');
const { Message } = db;
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.crearMensaje = async ({ mensaje, remitente_id, destinatario_id }) => {
  try {
    const nuevoMensaje = await Message.create({
      mensaje,
      remitente_id,
      destinatario_id,
      estado_mensaje: 'enviado',
      fecha_envio: new Date(),
      leido: false
    });

    logger.info(`Mensaje creado en la DB de ${remitente_id} a ${destinatario_id}`);
    return nuevoMensaje;
  } catch (error) {
    logger.error(`Error al crear mensaje en la DB: ${error.message}`);
    throw error;
  }
};

exports.obtenerConversacionEntreUsuarios = async (remitenteId, destinatarioId) => {
  try {
    await Message.update(
      { leido: true, estado_mensaje: "leído" },
      {
        where: {
          remitente_id: remitenteId,
          destinatario_id: destinatarioId,
          leido: false
        }
      }
    );
    logger.info(`Mensajes entre ${remitenteId} y ${destinatarioId} marcados como leídos`);

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
  } catch (error) {
    logger.error(`Error al obtener conversación entre ${remitenteId} y ${destinatarioId}: ${error.message}`);
    throw error;
  }
};

exports.obtenerMensajesDelUsuario = async (userId) => {
  try {
    const mensajes = await Message.findAll({
      attributes: ['mensaje', 'fecha_envio', 'estado_mensaje', 'remitente_id', 'destinatario_id'],
      where: {
        [Op.or]: [
          { remitente_id: userId },
          { destinatario_id: userId }
        ]
      },
      order: [['fecha_envio', 'DESC']]
    });

    return mensajes;
  } catch (error) {
    logger.error(`Error al obtener mensajes del usuario ${userId}: ${error.message}`);
    throw error;
  }
};

exports.obtenerInboxDelUsuario = async (userId) => {
  try {
    const mensajes = await Message.findAll({
      attributes: ['mensaje', 'fecha_envio', 'estado_mensaje', 'remitente_id', 'destinatario_id', 'leido'],
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

    logger.info(`Inbox generado para usuario ID ${userId} con ${conversaciones.length} conversaciones`);
    return conversaciones;
  } catch (error) {
    logger.error(`Error al generar inbox del usuario ${userId}: ${error.message}`);
    throw error;
  }
};