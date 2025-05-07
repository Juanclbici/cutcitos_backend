const authService = require('../../services/authService');
const logger = require('../../utils/logger');

exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    logger.info(`Intento de registro para ${email}`);

    const result = await authService.registerUser(req.body);
    logger.info(`Usuario registrado exitosamente: ${email}`);

    res.status(200).json({
      message: 'Usuario registrado exitosamente',
      ...result
    });
  } catch (error) {
    logger.error(`Error al registrar usuario: ${error.message}`);
    res.status(400).json({ 
      message: error.message || 'Error al registrar usuario'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    logger.info(`Inicio de sesión exitoso para: ${req.body.email}`);
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      ...result
    });
  } catch (error) {
    logger.warn(`Error de login para ${req.body.email}: ${error.message}`);
    const status = error.message === 'Credenciales inválidas' ? 401 : 
                   error.message === 'Cuenta bloqueada' ? 403 : 
                   error.message === 'Usuario no encontrado' ? 404 : 500;
    res.status(status).json({ 
      message: error.message || 'Error en autenticación'
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    logger.info(`Solicitud de reseteo de contraseña para: ${req.body.email}`);
    const result = await authService.requestPasswordReset(req.body.email, req.headers.host);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error en solicitud de reseteo: ${error.message}`);
    res.status(400).json({ 
      message: error.message || 'Error al procesar la solicitud'
    });
  }
};

exports.validateResetCode = async (req, res, next) => {
  try {
    const { email, code, npassword } = req.body;
    logger.info(`Validando código de reseteo para: ${email}`);
    const result = await authService.validateResetCode(email, code, npassword);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Código de reseteo inválido para ${req.body.email}: ${error.message}`);
    next(error);
  }
};