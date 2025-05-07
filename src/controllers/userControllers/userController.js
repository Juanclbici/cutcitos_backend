const userService = require('../../services/userService');
const { User } = require('../../models');
const logger = require('../../utils/logger');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    logger.info(`Perfil consultado para el usuario ID: ${req.user.id}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error al obtener perfil del usuario ID ${req.user.id}: ${error.message}`);
    res.status(404).json({ 
      message: error.message || 'Error al obtener perfil'
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    logger.info(`Perfil actualizado para el usuario ID: ${req.user.id}`);
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    logger.error(`Error al actualizar perfil del usuario ID ${req.user.id}: ${error.message}`);
    res.status(400).json({ 
      message: error.message || 'Error al actualizar perfil'
    });
  }
};

exports.getSellers = async (req, res) => {
  try {
    const sellers = await userService.getSellers();
    logger.info('Consulta de todos los vendedores realizada');
    res.json({ success: true, data: sellers });
  } catch (error) {
    logger.error(`Error al obtener vendedores: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error al obtener vendedores' });
  }
};