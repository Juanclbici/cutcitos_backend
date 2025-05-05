const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { crearMensaje, obtenerConversacion, obtenerMisConversaciones, obtenerInbox } = require("../controllers/userControllers/messageController");

// Crear un nuevo mensaje
router.post("/", verifyToken, crearMensaje);

// Ver conversación específica entre dos usuarios
router.get("/conversation/:remitenteId/:destinatarioId", verifyToken, obtenerConversacion);

// Ver todas tus conversaciones
router.get("/conversations", verifyToken, obtenerMisConversaciones);

//Lista de tus Conversaciones tipo WhatsApp
router.get('/inbox', verifyToken, obtenerInbox);

module.exports = router;
