const authService = require('../../services/authService');

exports.register = async (req, res) => {
  try {
    const { email } = req.body;

    const correoValido = email.endsWith('@alumnos.udg.mx') ||
                         email.endsWith('@academicos.udg.mx') ||
                         email.endsWith('@gmail.com');

    if (!correoValido) {
      return res.status(400).json({ message: 'Correo no permitido' });
    }

    const result = await authService.registerUser(req.body);
    res.status(200).json({
      message: 'Usuario registrado exitosamente',
      ...result
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      message: error.message || 'Error al registrar usuario'
    });
  }
};


exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      ...result
    });
  } catch (error) {
    console.error('Error en login:', error);
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
    const result = await authService.requestPasswordReset(req.body.email, req.headers.host);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      message: error.message || 'Error al procesar la solicitud'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.params.token);
    res.status(200).json({ 
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || 'Error al restablecer contraseña'
    });
  }
};

exports.validateResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    
    const result = await authService.validateResetCode(email, code);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};