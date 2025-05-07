const db = require('../models');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const { Op } = require('sequelize');

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

    if (!user) {
      logger.warn(`Perfil no encontrado para el usuario ID: ${userId}`);
      throw new Error('Usuario no encontrado');
    }

    logger.info(`Perfil solicitado para el usuario ID: ${userId}`);
    return user;
  },

  // Actualizar perfil de usuario
  async updateUserProfile(userId, { nombre, telefono, codigo_UDG, foto_perfil }) {
    const user = await db.User.findByPk(userId);
    if (!user) {
      logger.warn(`Intento de actualizar perfil - Usuario no encontrado: ${userId}`);
      throw new Error('Usuario no encontrado');
    }

    if (codigo_UDG && codigo_UDG !== user.codigo_UDG) {
      const existing = await db.User.findOne({
        where: { codigo_UDG },
        paranoid: false
      });
      if (existing) {
        logger.warn(`Código UDG duplicado detectado: ${codigo_UDG}`);
        throw new Error('El código UDG ya está registrado');
      }
    }

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (telefono) updates.telefono = telefono;
    if (codigo_UDG) updates.codigo_UDG = codigo_UDG;

    if (foto_perfil && foto_perfil !== user.foto_perfil) {
      const isOldCloudinary = user.foto_perfil?.startsWith('http') &&
        !user.foto_perfil.includes('default_profile.jpg');

      if (isOldCloudinary) {
        try {
          const publicId = user.foto_perfil
            .split('/')
            .slice(-2)
            .join('/')
            .replace(/\.(jpg|png|jpeg|webp)$/, '');

          await cloudinary.uploader.destroy(publicId);
          logger.info(`Imagen anterior eliminada de Cloudinary: ${publicId}`);
        } catch (err) {
          logger.warn(`No se pudo eliminar la imagen anterior: ${err.message}`);
        }
      }

      updates.foto_perfil = foto_perfil;
    }

    await user.update(updates);
    logger.info(`Perfil actualizado para el usuario ID: ${userId}`);

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
    if (!user) {
      logger.warn(`Intento de eliminar usuario - No encontrado: ${userId}`);
      throw new Error('Usuario no encontrado');
    }

    await user.destroy();
    logger.info(`Usuario eliminado correctamente (soft delete) - ID: ${userId}`);
    return { message: 'Usuario eliminado correctamente' };
  },

  // Obtener todos los usuarios (para admin)
  async getAllUsersadmin() {
    const users = await db.User.findAll({
      attributes: {
        exclude: [
          'password',
          'resetPasswordToken',
          'resetPasswordExpires'
        ]
      },
      paranoid: false
    });

    logger.info(`Consulta de todos los usuarios (incluidos eliminados) realizada`);
    return users;
  },

  // Cambiar rol de usuario (para admin)
  async changeUserRole(userId, newRole) {
    const validRoles = ['admin', 'seller', 'buyer'];
    if (!validRoles.includes(newRole)) {
      logger.warn(`Intento de asignar rol inválido: ${newRole}`);
      throw new Error('Rol no válido');
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      logger.warn(`Cambio de rol fallido - Usuario no encontrado: ${userId}`);
      throw new Error('Usuario no encontrado');
    }

    await user.update({ rol: newRole });
    logger.info(`Rol actualizado a '${newRole}' para el usuario ID: ${userId}`);

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

      logger.info('Lista de vendedores obtenida correctamente');
      return sellers;
    } catch (error) {
      logger.error(`Error al obtener vendedores: ${error.message}`);
      throw new Error('No se pudieron obtener los vendedores');
    }
  },
  async getAllUsers() {
    try {
      const users = await db.User.findAll({
        attributes: [
          'user_id',
          'nombre',
          'email',
          'rol',
          'telefono',
          'codigo_UDG',
          'estado_cuenta',
          'foto_perfil',
          'createdAt'
        ],
        where: {
          estado_cuenta: 'active'  // si solo quieres activos; si no, elimina esta línea
        },
        order: [['nombre', 'ASC']]
      });
  
      logger.info(`getAllUsers: ${users.length} usuarios encontrados`);
      return users;
    } catch (error) {
      logger.error(`Error en getAllUsers: ${error.message}`);
      throw new Error('No se pudo obtener la lista de usuarios');
    }
  }
};

module.exports = userService;
