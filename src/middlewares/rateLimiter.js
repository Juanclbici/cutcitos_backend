const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // Máximo 5 intentos por IP
  message: {
    message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 5 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = loginLimiter;
