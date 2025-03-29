const User = require('../models/user');

// Obtener información del usuario actual
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener perfil de usuario', error: error.message });
  }
};

// Actualizar perfil de usuario
exports.updateUserProfile = async (req, res) => {
  try {
    const { nombre, telefono, codigo_UDG } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el nuevo código UDG ya existe (si se está actualizando)
    if (codigo_UDG && codigo_UDG !== user.codigo_UDG) {
      const existingUDGCode = await User.findOne({ where: { codigo_UDG } });
      if (existingUDGCode) {
        return res.status(400).json({ message: 'El código UDG ya está registrado' });
      }
    }
    
    // Actualizar campos
    user.nombre = nombre || user.nombre;
    user.telefono = telefono || user.telefono;
    user.codigo_UDG = codigo_UDG || user.codigo_UDG;
    
    await user.save();
    
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: {
        user_id: user.user_id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        codigo_UDG: user.codigo_UDG,
        foto_perfil: user.foto_perfil
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};