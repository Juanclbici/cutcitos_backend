const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Configuración de email (podrías mover esto a un config aparte)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const authService = {
  // Registro de usuario
  async registerUser({ nombre, email, password, codigo_UDG, telefono,rol }) {
    // Verificar email existente
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new Error('El email ya está registrado');

    // Verificar código UDG si se proporciona
    if (codigo_UDG) {
      const existingUDGCode = await User.findOne({ where: { codigo_UDG } });
      if (existingUDGCode) throw new Error('El código UDG ya está registrado');
    }

    // Crear usuario
    const newUser = await User.create({
      nombre,
      email,
      password,
      codigo_UDG,
      telefono,
      rol
    });

    // Generar token
    const token = jwt.sign(
      { id: newUser.user_id, rol: newUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        user_id: newUser.user_id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        codigo_UDG: newUser.codigo_UDG
      },
      token
    };
  },

  // Inicio de sesión
  async loginUser({ email, password }) {
    const user = await User.findOne({
      where: { email },
      attributes: ['user_id', 'nombre', 'email', 'password', 'rol', 'estado_cuenta']
    });

    if (!user) throw new Error('Usuario no encontrado');
    if (user.estado_cuenta === 'bloqueado') throw new Error('Cuenta bloqueada');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Credenciales inválidas');

    const token = jwt.sign(
      { id: user.user_id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        user_id: user.user_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      token
    };
  },

  // Solicitud de reset de contraseña
  async requestPasswordReset(email, host) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Usuario no encontrado');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    const resetUrl = `http://${host}/api/auth/reset-password/${resetToken}`;

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

    return { 
      message: 'Correo de restablecimiento enviado',
      token: process.env.NODE_ENV === 'development' ? resetToken : undefined
    };
  },

  // Reset de contraseña
  async resetPassword(token) {
    const user = await User.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) throw new Error('Token inválido o expirado');

    const newPassword = 'cutcitos123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }, { hooks: false });

    // Verificación
    const updatedUser = await User.findOne({
      where: { user_id: user.user_id },
      attributes: ['password'],
      raw: true
    });

    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    if (!isMatch) throw new Error('Fallo en verificación post-actualización');

    return { success: true };
  }
};

module.exports = authService;