const db = require('../models');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const userService = {
  // Obtener perfil de usuario
  async getUserProfile(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: { 
        exclude: [
          'password', 
          'resetPasswordToken', 
          'resetPasswordExpires',
          'updatedAt',
          'deletedAt'
        ] 
      }
    });
    
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },

  // Actualizar perfil de usuario
  async updateUserProfile(userId, { nombre, telefono, codigo_UDG, foto_perfil }) {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');
  
    // Verificar duplicado de código UDG
    if (codigo_UDG && codigo_UDG !== user.codigo_UDG) {
      const existing = await db.User.findOne({ 
        where: { codigo_UDG },
        paranoid: false 
      });
      if (existing) throw new Error('El código UDG ya está registrado');
    }
  
    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (telefono) updates.telefono = telefono;
    if (codigo_UDG) updates.codigo_UDG = codigo_UDG;
  
    // Si se cambia la foto de perfil
    if (foto_perfil && foto_perfil !== user.foto_perfil) {
      const isOldCloudinary = user.foto_perfil?.startsWith('http') && !user.foto_perfil.includes('default_profile.jpg');
  
      // Eliminar imagen anterior de Cloudinary si aplica
      if (isOldCloudinary) {
        try {
          const publicId = user.foto_perfil
            .split('/')
            .slice(-2)
            .join('/')
            .replace('.jpg', '')
            .replace('.png', '')
            .replace('.jpeg', '')
            .replace('.webp', '');
  
          await cloudinary.uploader.destroy(publicId);
          console.log('✅ Imagen anterior eliminada:', publicId);
        } catch (err) {
          console.warn('⚠️ No se pudo eliminar la imagen anterior:', err.message);
        }
      }
  
      updates.foto_perfil = foto_perfil;
    }
  
    await user.update(updates);
  
    return {
      user_id: user.user_id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      codigo_UDG: user.codigo_UDG,
      foto_perfil: user.foto_perfil,
      rol: user.rol
    };
  },
  

  // Eliminar usuario (soft delete)
  async deleteUser(userId) {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    await user.destroy();
    return { message: 'Usuario eliminado correctamente' };
  },

  // Obtener todos los usuarios (para admin)
  async getAllUsers() {
    return await db.User.findAll({
      attributes: { 
        exclude: [
          'password', 
          'resetPasswordToken', 
          'resetPasswordExpires'
        ] 
      },
      paranoid: false // Incluye usuarios eliminados lógicamente
    });
  },

  // Cambiar rol de usuario (para admin)
  async changeUserRole(userId, newRole) {
    const validRoles = ['admin', 'seller', 'buyer'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Rol no válido');
    }

    const user = await db.User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    await user.update({ rol: newRole });
    return {
      user_id: user.user_id,
      email: user.email,
      new_role: user.rol
    };
  },
  // Obtener lista de vendedores
  async getSellers() {
    try {
      const sellers = await db.User.findAll({
        where: { rol: 'seller', deleted_at: null },
        attributes: [
          'user_id',
          'nombre',
          'email',
          'foto_perfil',
          'telefono',
          'codigo_UDG',
          'rol'
        ]
      });

      return sellers;
    } catch (error) {
      console.error('Error en userService.getSellers:', error);
      throw new Error('No se pudieron obtener los vendedores');
    }
  }


};

module.exports = userService;