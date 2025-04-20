const userService = require('../../services/userService');
const { User } = require('../../models');

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

exports.getSellers = async (req, res) => {
  try {
    const sellers = await userService.getSellers();
    res.json({ success: true, data: sellers });
  } catch (error) {
    console.error('Error al obtener vendedores:', error);
    res.status(500).json({ success: false, message: 'Error al obtener vendedores' });
  }
};