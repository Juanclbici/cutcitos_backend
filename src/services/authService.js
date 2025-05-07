const db = require('../models');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Configuración de email
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const authService = {
  async registerUser({ nombre, email, password, codigo_UDG, telefono, rol = 'buyer' }) {
    logger.info(`Intento de registro para ${email}`);

    const existingUser = await db.User.findOne({ where: { email }, paranoid: false });
    if (existingUser) {
      logger.warn(`Registro fallido - Email ya registrado: ${email}`);
      throw new Error('El email ya está registrado');
    }

    if (codigo_UDG) {
      const existingUDGCode = await db.User.findOne({ where: { codigo_UDG }, paranoid: false });
      if (existingUDGCode) {
        logger.warn(`Registro fallido - Código UDG duplicado: ${codigo_UDG}`);
        throw new Error('El código UDG ya está registrado');
      }
    }

    const assignedRole = rol ? rol.toLowerCase() : 'buyer';

    const newUser = await db.User.create({
      nombre,
      email,
      password,
      codigo_UDG,
      telefono,
      rol: assignedRole
    });

    logger.info(`Usuario creado exitosamente: ${email}`);

    const token = jwt.sign(
      {
        id: newUser.user_id,
        rol: newUser.rol,
        email: newUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Token generado para: ${email}`);

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

  async loginUser({ email, password }) {
    const user = await db.User.scope('withPassword').findOne({
      where: {
        email,
        estado_cuenta: 'active'
      }
    });

    if (!user) {
      logger.warn(`Login fallido - Usuario no encontrado o inactivo: ${email}`);
      throw new Error('Credenciales inválidas o cuenta inactiva');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login fallido - Contraseña incorrecta para: ${email}`);
      throw new Error('Credenciales inválidas');
    }

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

    logger.info(`Login exitoso para: ${email}`);

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

  async requestPasswordReset(email) {
    logger.info(`Solicitud de reset para: ${email}`);

    const user = await db.User.findOne({ where: { email }, paranoid: false });
    if (!user) {
      logger.warn(`Reset fallido - Usuario no encontrado: ${email}`);
      throw new Error('Usuario no encontrado');
    }

    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const resetCodeExpiry = Date.now() + 3600000;

    await user.update({
      resetPasswordToken: resetCode,
      resetPasswordExpires: new Date(resetCodeExpiry)
    });

    logger.info(`Código de recuperación generado para ${email}: ${resetCode}`);

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Código para restablecer tu contraseña',
      html: `
        <p>Hola ${user.nombre},</p>
        <p>Has solicitado cambiar tu contraseña en ${process.env.APP_NAME || 'Cutcitos'}.</p>
        <p>Tu código de verificación es: <strong>${resetCode}</strong></p>
        <p>Este código expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
        <p>Atentamente,<br>El equipo de ${process.env.APP_NAME || 'Cutcitos'}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Correo de recuperación enviado a: ${email}`);

    return {
      message: 'Correo con código de verificación enviado',
      code: process.env.NODE_ENV === 'development' ? resetCode : undefined
    };
  },

  async validateResetCode(email, code, npassword) {
    logger.info(`Validando código de reseteo para ${email}`);

    if (!email || !code || !npassword) {
      logger.warn(`Datos incompletos en validación de código - Email: ${email}`);
      throw new Error('Faltan datos');
    }

    if (code.length !== 5 || !/^\d+$/.test(code)) {
      logger.warn(`Código inválido: ${code}`);
      throw new Error('El código debe ser de 5 dígitos numéricos');
    }

    const user = await db.User.findOne({
      where: {
        email,
        resetPasswordToken: code,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      logger.warn(`Código de reset inválido o expirado para: ${email}`);
      throw new Error('Código inválido, expirado o email incorrecto');
    }

    await user.update({
      password: npassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      mustChangePassword: true
    });

    logger.info(`Contraseña actualizada para: ${email}`);

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Contraseña actualizada',
      html: `
        <p>Hola ${user.nombre},</p>
        <p>Tu contraseña ha sido actualizada exitosamente.</p>
        <p>Atentamente,<br>El equipo de ${process.env.APP_NAME || 'Cutcitos'}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Correo de confirmación de contraseña enviado a: ${email}`);

    return {
      success: true,
      message: 'Contraseña actualizada correctamente.',
      email: user.email
    };
  },

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.User.findByPk(decoded.id, {
        attributes: ['user_id', 'nombre', 'email', 'rol', 'estado_cuenta']
      });

      if (!user || user.estado_cuenta !== 'active') {
        logger.warn(`Token inválido o cuenta inactiva para ID: ${decoded.id}`);
        throw new Error('Usuario no válido');
      }

      logger.info(`Token verificado correctamente para: ${user.email}`);

      return {
        valid: true,
        user,
        decoded
      };
    } catch (error) {
      logger.error(`Error al verificar token: ${error.message}`);
      return {
        valid: false,
        error: error.message
      };
    }
  }
};

module.exports = authService;