const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
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

    // 1. Buscar usuario incluyendo solo campos necesarios
    const user = await User.findOne({
      where: { email },
      attributes: ['user_id', 'nombre', 'email', 'password', 'rol', 'estado_cuenta']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Verificar estado de cuenta
    if (user.estado_cuenta === 'bloqueado') {
      return res.status(403).json({ message: 'Cuenta bloqueada' });
    }

    // 3. Comparación de contraseña mejorada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas',
        debug: {
          inputPassword: password,
          storedHash: user.password,
          comparisonResult: isMatch
        }
      });
    }

    // 4. Generar token
    const token = jwt.sign(
      { id: user.user_id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Responder sin datos sensibles
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        user_id: user.user_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      message: 'Error en autenticación',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
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

    // 4. Crear enlace de reset con la nueva contraseña fija
    const resetUrl = `http://${req.headers.host}/api/auth/reset-password/${resetToken}`;

    // 5. Enviar email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Restablecimiento de contraseña',
      html: `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña en Cutcitos.</p>
        <p>Al hacer clic en el siguiente enlace, tu contraseña será cambiada automáticamente a <strong>cutcitos123</strong>:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña',
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
    
    // 1. Buscar usuario con el token
    const user = await User.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Token inválido o expirado' 
      });
    }

    // 2. Generar nueva contraseña
    const newPassword = 'cutcitos123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 3. Actualizar directamente con el hash (sin hooks)
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }, { hooks: false }); // Desactiva hooks para evitar problemas

    // 4. Verificación directa en la base de datos
    const updatedUser = await User.findOne({
      where: { user_id: user.user_id },
      attributes: ['password'],
      raw: true
    });

    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    if (!isMatch) {
      console.error('Error de coincidencia:', {
        newPassword,
        storedHash: updatedUser.password
      });
      throw new Error('Fallo en verificación post-actualización');
    }

    res.status(200).json({ 
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error detallado en resetPassword:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
    res.status(500).json({ 
      success: false,
      message: 'Error al restablecer contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};