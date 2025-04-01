const User = require('../models/user');

const userService = {
  // Obtener perfil de usuario
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },

  // Actualizar perfil de usuario
  async updateUserProfile(userId, { nombre, telefono, codigo_UDG }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Verificar código UDG si se está actualizando
    if (codigo_UDG && codigo_UDG !== user.codigo_UDG) {
      const existingUDGCode = await User.findOne({ where: { codigo_UDG } });
      if (existingUDGCode) throw new Error('El código UDG ya está registrado');
    }

    // Actualizar campos
    user.nombre = nombre || user.nombre;
    user.telefono = telefono || user.telefono;
    user.codigo_UDG = codigo_UDG || user.codigo_UDG;
    
    await user.save();

    return {
      user_id: user.user_id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      codigo_UDG: user.codigo_UDG,
      foto_perfil: user.foto_perfil
    };
  }
};

module.exports = userService;