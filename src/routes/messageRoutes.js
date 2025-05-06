const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { crearMensaje, obtenerConversacion, obtenerMisConversaciones, obtenerInbox } = require("../controllers/userControllers/messageController");

/**
 * @swagger
 * tags:
 *   name: Mensajes
 *   description: Endpoints para enviar y consultar mensajes
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Crear un nuevo mensaje
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mensaje
 *               - destinatario_id
 *             properties:
 *               mensaje:
 *                 type: string
 *               destinatario_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: Faltan campos requeridos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verifyToken, crearMensaje);

/**
 * @swagger
 * /messages/conversation/{remitenteId}:
 *   get:
 *     summary: Obtener conversación específica entre dos usuarios
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: remitenteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del remitente
 *     responses:
 *       200:
 *         description: Mensajes obtenidos
 *       400:
 *         description: Faltan IDs
 *       500:
 *         description: Error interno del servidor
 */
router.get('/conversation/:remitenteId', verifyToken, obtenerConversacion);

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Obtener todas tus conversaciones
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversaciones
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.get('/conversations', verifyToken, obtenerMisConversaciones);

/**
 * @swagger
 * /messages/inbox:
 *   get:
 *     summary: Obtener la bandeja de entrada (últimos mensajes por usuario)
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de últimas conversaciones por usuario
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.get('/inbox', verifyToken, obtenerInbox);

module.exports = router;
