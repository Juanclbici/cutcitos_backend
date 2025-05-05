const messageService = require('../../services/messageService');

// CREAR UN MENSAJE
exports.crearMensaje = async (req, res) => {
  try {
    const { mensaje, destinatario_id } = req.body;
    const remitente = req.user;

    if (!mensaje || !destinatario_id) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    const nuevoMensaje = await messageService.crearMensaje({
      mensaje,
      remitente_id: req.body.remitente_id || emisor.user_id,
      destinatario_id
    });

    return res.status(201).json(nuevoMensaje);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// OBTENER UNA CONVERSACIÓN ENTRE DOS USUARIOS
exports.obtenerConversacion = async (req, res) => {
  try {
    const { remitenteId, destinatarioId } = req.params;

    if (!remitenteId || !destinatarioId) {
      return res.status(400).json({ message: "Faltan IDs de usuarios." });
    }

    const mensajes = await messageService.obtenerConversacionEntreUsuarios(remitenteId, destinatarioId);
    res.status(200).json(mensajes);

  } catch (error) {
    console.error("Error al obtener conversación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// OBTENER TODAS MIS CONVERSACIONES
exports.obtenerMisConversaciones = async (req, res) => {
  try {
    const remitente_id = req.user?.id;

    if (!remitente_id) {
      return res.status(401).json({ message: 'No autorizado: ID del remitente no disponible' });
    }

    const mensajes = await messageService.obtenerMensajesDelUsuario(remitente_id);
    res.json(mensajes);
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//INBOX
// Busca los últimos mensajes que el usuario haya enviado o recibido,
// y construye una lista única de conversaciones, mostrando
// solo el último mensaje y el ID del otro usuario con quien habló.
exports.obtenerInbox = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const conversaciones = await messageService.obtenerInboxDelUsuario(userId);
    res.status(200).json(conversaciones);

  } catch (error) {
    console.error('Error al obtener inbox:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
