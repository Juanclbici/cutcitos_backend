const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { contarNotificacionesNoLeidas } = require('../controllers/userControllers/notificationController');

router.get('/unread-count', verifyToken, contarNotificacionesNoLeidas);

module.exports = router;
