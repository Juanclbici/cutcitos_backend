const logger = require('../utils/logger');

const validarCorreo = (req, res, next) => {
  const { email } = req.body;

  const correoValido = email &&
    (email.endsWith('@alumnos.udg.mx') ||
     email.endsWith('@academicos.udg.mx') ||
     email.endsWith('@cutonala.udg.mx') ||
     email.endsWith('@gmail.com'));

  if (!correoValido) {
    logger.warn(`Correo no permitido: ${email}`);
    return res.status(400).json({ message: 'Correo no permitido, debe ser institucional de UDG' });
  }

  next();
};

module.exports = validarCorreo;
