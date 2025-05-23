const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      rol: decoded.rol
    };    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    // Si el usuario es admin, permitir acceso total
    if (req.user.rol === 'admin') {
      return next();
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    next();
  };
};
