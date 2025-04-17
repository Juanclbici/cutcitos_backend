const { body } = require('express-validator');

exports.validateResetRequest = [
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail()
];

exports.validateResetPassword = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .not().isIn(['12345678', 'password']).withMessage('No uses contraseñas comunes')
];