const notificationService = require('../../services/notificationService');


// Notiifcaciones no leídas
exports.contarNotificacionesNoLeidas = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const totalNoLeidas = await notificationService.contarNoLeidas(userId);
    res.status(200).json({ no_leidas: totalNoLeidas });

  } catch (error) {
    console.error("Error al contar notificaciones no leídas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
