const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Registrar nuevo usuarios
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, codigo_UDG, telefono } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Verificar si el código UDG ya existe
    if (codigo_UDG) {
      const existingUDGCode = await User.findOne({ where: { codigo_UDG } });
      if (existingUDGCode) {
        return res.status(400).json({ message: 'El código UDG ya está registrado' });
      }
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      nombre,
      email,
      password,
      codigo_UDG,
      telefono
    });

    // Crear token
    const token = jwt.sign(
      { id: newUser.user_id, rol: newUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        user_id: newUser.user_id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        codigo_UDG: newUser.codigo_UDG
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar estado de la cuenta
    if (user.estado_cuenta === 'bloqueado') {
      return res.status(403).json({ message: 'Tu cuenta está bloqueada' });
    }

    // Verificar contraseña
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Crear token
    const token = jwt.sign(
      { id: user.user_id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        user_id: user.user_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        foto_perfil: user.foto_perfil,
        codigo_UDG: user.codigo_UDG
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

//request password reset


// Configuración básica del transporter (debes configurarlo con tu servicio de email)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Generar token único con fecha de expiración
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora de validez

    // 3. Guardar token en la base de datos
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    // 4. Crear enlace de reset
    const resetUrl = `http://${req.headers.host}/api/auth/reset-password/${resetToken}`;

    // 5. Enviar email (configura esto según tu proveedor de email)
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Restablecimiento de contraseña',
      text: `Para restablecer tu contraseña, haz clic en el siguiente enlace:\n\n${resetUrl}\n\n` +
            `Si no solicitaste este cambio, ignora este mensaje.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña',
      // En desarrollo puedes incluir el token para pruebas
      token: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud de restablecimiento',
      error: error.message 
    });
  }
};

//Reset password

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // 1. Buscar usuario por token válido (usando Sequelize.Op)
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Sequelize.Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'El token de restablecimiento es inválido o ha expirado' 
      });
    }

    // 2. Actualizar contraseña
    await user.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.status(200).json({ 
      message: 'Contraseña actualizada correctamente' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Error al restablecer la contraseña',
      error: error.message 
    });
  }
};