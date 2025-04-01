const userService = require('../services/userService');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(404).json({ 
      message: error.message || 'Error al obtener perfil'
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(
      req.user.id, 
      req.body
    );
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      message: error.message || 'Error al actualizar perfil'
    });
  }
};