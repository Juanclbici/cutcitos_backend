const db = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Configuración de email
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
      paranoid: false
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
  
    // Asignar rol según entorno
   // const assignedRole = process.env.NODE_ENV === 'test' ? rol.toLowerCase() : 'buyer'; para usar test usar este y comentar el de abajo
    const assignedRole = rol ? rol.toLowerCase() : 'buyer';

  
    // Crear usuario
    const newUser = await db.User.create({
      nombre,
      email,
      password,
      codigo_UDG,
      telefono,
      rol: assignedRole
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
  
    // Retornar datos seguros
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

  // Solicitud de reset de contraseña con código de 5 dígitos
  async requestPasswordReset(email) {
    const user = await db.User.findOne({ 
      where: { email },
      paranoid: false
    });
    
    if (!user) throw new Error('Usuario no encontrado');

    // Generar código de 5 dígitos
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const resetCodeExpiry = Date.now() + 3600000; // 1 hora

    await user.update({
      resetPasswordToken: resetCode,
      resetPasswordExpires: new Date(resetCodeExpiry)
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Código para restablecer tu contraseña',
      html: `
        <p>Hola ${user.nombre},</p>
        <p>Has solicitado restablecer tu contraseña en ${process.env.APP_NAME || 'Cutcitos'}.</p>
        <p>Tu código de verificación es: <strong>${resetCode}</strong></p>
        <p>Ingresa este código en la aplicación para completar el proceso.</p>
        <p><strong>Al ingresar este código, tu contraseña será cambiada automáticamente a: cutcitos123</strong></p>
        <p>Este código expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
        <p>Atentamente,<br>El equipo de ${process.env.APP_NAME || 'Cutcitos'}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return { 
      message: 'Correo con código de verificación enviado',
      // Solo en desarrollo devolvemos el código para testing
      code: process.env.NODE_ENV === 'development' ? resetCode : undefined
    };
  },

  // Validación del código y reseteo de contraseña
  async validateResetCode(email, code) {
    // Validaciones básicas
    if (!email || !code) {
        throw new Error('Email y código son requeridos');
    }

    if (code.length !== 5 || !/^\d+$/.test(code)) {
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
        throw new Error('Código inválido, expirado o email incorrecto');
    }
    
    // Establecemos la contraseña genérica
    await user.update({
        password: "cutcitos123",
        resetPasswordToken: null,
        resetPasswordExpires: null,
        mustChangePassword: true
    });

    // enviar correo de confirmación
    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Contraseña actualizada',
        html: `
            <p>Hola ${user.nombre},</p>
            <p>Tu contraseña ha sido actualizada exitosamente.</p>
            <p>Tu nueva contraseña temporal es: <strong>cutcitos123</strong></p>
            <p>Por seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.</p>
            <p>Atentamente,<br>El equipo de ${process.env.APP_NAME || 'Cutcitos'}</p>
        `
    };
    
    await transporter.sendMail(mailOptions).catch(console.error);

    return { 
        success: true,
        message: 'Contraseña actualizada correctamente. Por favor revisa tu correo para ver tu nueva contraseña temporal.',
        email: user.email 
    };
},
  // Reset de contraseña
  async resetPassword(token) { 
    const user = await db.User.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) throw new Error('Token inválido o expirado');
    
    // Establecemos siempre la contraseña genérica
    await user.update({
      password: "cutcitos123", 
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return { 
      success: true,
      message: 'Contraseña actualizada correctamente a la contraseña temporal: cutcitos123'
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