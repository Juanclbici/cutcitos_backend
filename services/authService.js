const db = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Configuración de email (recomendado mover a config/email.js)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const authService = {
  // Registro de usuario
  async registerUser({ nombre, email, password, codigo_UDG, telefono, rol = 'buyer' }) {
    // Verificar email existente
    const existingUser = await db.User.findOne({ 
      where: { email },
      paranoid: false // Busca incluso usuarios eliminados lógicamente
    });
    if (existingUser) throw new Error('El email ya está registrado');

    // Verificar código UDG si se proporciona
    if (codigo_UDG) {
      const existingUDGCode = await db.User.findOne({ 
        where: { codigo_UDG },
        paranoid: false
      });
      if (existingUDGCode) throw new Error('El código UDG ya está registrado');
    }

    // Crear usuario usando el modelo del index
    const newUser = await db.User.create({
      nombre,
      email,
      password, // Se encripta automáticamente por los hooks
      codigo_UDG,
      telefono,
      rol: rol.toLowerCase() // Aseguramos minúsculas
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: newUser.user_id, 
        rol: newUser.rol,
        email: newUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retornamos datos seguros (excluyendo información sensible)
    return {
      user: {
        user_id: newUser.user_id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        foto_perfil: newUser.foto_perfil
      },
      token
    };
  },

  // Inicio de sesión
  async loginUser({ email, password }) {
    // Usamos el scope 'withPassword' para incluir la contraseña
    const user = await db.User.scope('withPassword').findOne({
      where: { 
        email,
        estado_cuenta: 'active' // Solo cuentas activas pueden iniciar sesión
      }
    });

    if (!user) throw new Error('Credenciales inválidas o cuenta inactiva');
    
    // Verificamos la contraseña usando el método del modelo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Credenciales inválidas');

    // Generar token JWT con más datos relevantes
    const token = jwt.sign(
      { 
        id: user.user_id, 
        rol: user.rol,
        email: user.email,
        nombre: user.nombre
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: process.env.JWT_ISSUER || 'cutcitos-api'
      }
    );

    return {
      user: {
        user_id: user.user_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        foto_perfil: user.foto_perfil,
        telefono: user.telefono
      },
      token
    };
  },

  // Solicitud de reset de contraseña
  async requestPasswordReset(email, host) {
    const user = await db.User.findOne({ 
      where: { email },
      paranoid: false // Busca incluso usuarios eliminados lógicamente
    });
    
    if (!user) throw new Error('Usuario no encontrado');

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(resetTokenExpiry)
    });

    const resetUrl = `${process.env.FRONTEND_URL || `http://${host}`}/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Restablecimiento de contraseña',
      html: `
        <p>Hola ${user.nombre},</p>
        <p>Has solicitado restablecer tu contraseña en ${process.env.APP_NAME || 'Cutcitos'}.</p>
        <p>Por favor, haz clic en el siguiente enlace para continuar con el proceso:</p>
        <p><a href="${resetUrl}">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
        <p>Atentamente,<br>El equipo de ${process.env.APP_NAME || 'Cutcitos'}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return { 
      message: 'Correo de restablecimiento enviado',
      // Solo en desarrollo devolvemos el token para testing
      token: process.env.NODE_ENV === 'development' ? resetToken : undefined
    };
  },

  // Reset de contraseña
  async resetPassword(token, newPassword) {
    const user = await db.User.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) throw new Error('Token inválido o expirado');
    
    // Actualizamos la contraseña (se encriptará automáticamente por el hook)
    await user.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    // Opcional: Invalidar tokens JWT existentes del usuario aquí

    return { 
      success: true,
      message: 'Contraseña actualizada correctamente'
    };
  },

  // Verificación de token (para uso en middlewares)
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.User.findByPk(decoded.id, {
        attributes: ['user_id', 'nombre', 'email', 'rol', 'estado_cuenta']
      });
      
      if (!user || user.estado_cuenta !== 'active') {
        throw new Error('Usuario no válido');
      }
      
      return {
        valid: true,
        user,
        decoded
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
};

module.exports = authService;