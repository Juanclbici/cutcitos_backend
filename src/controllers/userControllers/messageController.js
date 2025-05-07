const messageService = require('../../services/messageService');
const logger = require('../../utils/logger');

exports.crearMensaje = async (req, res) => {
  try {
    const { mensaje, destinatario_id } = req.body;
    const remitente = req.user.id;

    if (!mensaje || !destinatario_id) {
      logger.warn(`Faltan campos requeridos en mensaje - Usuario ID: ${remitente}`);
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    const nuevoMensaje = await messageService.crearMensaje({
      mensaje,
      remitente_id: remitente,
      destinatario_id
    });

    logger.info(`Mensaje enviado de ${remitente} a ${destinatario_id}`);
    return res.status(201).json(nuevoMensaje);
  } catch (error) {
    logger.error(`Error al enviar mensaje: ${error.message}`);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.obtenerConversacion = async (req, res) => {
  try {
    const { remitenteId } = req.params;
    const destinatarioId = parseInt(req.user.id, 10);

    if (!remitenteId || !destinatarioId) {
      logger.warn('Faltan IDs para obtener conversación');
      return res.status(400).json({ message: "Faltan IDs de usuarios." });
    }

    const mensajes = await messageService.obtenerConversacionEntreUsuarios(remitenteId, destinatarioId);
    logger.info(`Conversación entre ${remitenteId} y ${destinatarioId} consultada`);
    res.status(200).json(mensajes);

  } catch (error) {
    logger.error(`Error al obtener conversación: ${error.message}`);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.obtenerMisConversaciones = async (req, res) => {
  try {
    const remitente_id = req.user?.id;

    if (!remitente_id) {
      logger.warn('Acceso no autorizado a conversaciones sin ID de usuario');
      return res.status(401).json({ message: 'No autorizado: ID del remitente no disponible' });
    }

    const mensajes = await messageService.obtenerMensajesDelUsuario(remitente_id);
    logger.info(`Conversaciones del usuario ${remitente_id} obtenidas`);
    res.json(mensajes);
  } catch (error) {
    logger.error(`Error al obtener conversaciones: ${error.message}`);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.obtenerInbox = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      logger.warn('Intento de acceder al inbox sin autenticación');
      return res.status(401).json({ message: 'No autorizado' });
    }

    const conversaciones = await messageService.obtenerInboxDelUsuario(userId);
    logger.info(`Inbox obtenido para usuario ID: ${userId}`);
    res.status(200).json(conversaciones);

  } catch (error) {
    logger.error(`Error al obtener inbox: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
