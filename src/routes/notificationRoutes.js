const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { contarNotificacionesNoLeidas } = require('../controllers/userControllers/notificationController');

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Obtener cantidad de notificaciones no leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Número de notificaciones no leídas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: No autorizado - Token inválido o no enviado
 */
router.get('/unread-count', verifyToken, contarNotificacionesNoLeidas);

module.exports = router;
