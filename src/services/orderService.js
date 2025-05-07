const db = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const orderService = {
  // Crear nuevo pedido (Estudiante)
  async createOrder(user_id, vendedor_id, productos, metodo_pago, direccion_entrega) {
    const transaction = await db.sequelize.transaction();

    try {
      let total = 0;

      for (const item of productos) {
        const producto = await db.Product.findByPk(item.producto_id, { transaction });
        if (!producto) {
          logger.warn(`Producto no encontrado: ${item.producto_id}`);
          throw new Error(`Producto ID ${item.producto_id} no encontrado`);
        }

        if (producto.cantidad_disponible < item.cantidad) {
          logger.warn(`Stock insuficiente para producto ID ${item.producto_id}`);
          throw new Error(`Stock insuficiente para producto ID ${item.producto_id}`);
        }

        total += producto.precio * item.cantidad;
      }

      const nuevaOrden = await db.Order.create({
        usuario_id: user_id,
        vendedor_id,
        total,
        estado_pedido: 'pendiente',
        metodo_pago,
        direccion_entrega
      }, { transaction });

      for (const item of productos) {
        await nuevaOrden.addProducto(item.producto_id, {
          through: { cantidad: item.cantidad },
          transaction
        });
      }

      await transaction.commit();
      logger.info(`Pedido creado exitosamente - ID: ${nuevaOrden.pedido_id}, Usuario: ${user_id}`);
      return nuevaOrden;

    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al crear pedido: ${error.message}`);
      throw error;
    }
  },

  // Confirmar pedido (Vendedor)
  async confirmOrder(vendorId, pedidoId) {
    const transaction = await db.sequelize.transaction();

    try {
      const pedido = await db.Order.findOne({
        where: { pedido_id: pedidoId },
        include: [{
          model: db.Product,
          as: 'Productos',
          where: { vendedor_id: vendorId }
        }],
        transaction
      });

      if (!pedido) {
        logger.warn(`Confirmación fallida - Pedido no encontrado o no autorizado: ID ${pedidoId}`);
        throw new Error('Pedido no encontrado o no autorizado');
      }

      if (pedido.estado_pedido !== 'pendiente') {
        logger.warn(`Intento de confirmar pedido no pendiente - ID ${pedidoId}`);
        throw new Error('El pedido no está pendiente');
      }

      await pedido.update({
        estado_pedido: 'confirmado',
        vendedor_confirmado: true,
        fecha_confirmacion_vendedor: new Date()
      }, { transaction });

      await transaction.commit();
      logger.info(`Pedido confirmado - ID: ${pedidoId}, Vendedor: ${vendorId}`);
      return pedido;

    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al confirmar pedido ID ${pedidoId}: ${error.message}`);
      throw error;
    }
  },

  // Cancelar pedido (Estudiante o Vendedor con validaciones)
  async cancelOrder(userId, pedidoId, isVendor = false) {
    const transaction = await db.sequelize.transaction();

    try {
      const pedido = await db.Order.findOne({
        where: { pedido_id: pedidoId },
        include: [{
          model: db.Product,
          as: 'Productos',
          include: [{
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id']
          }]
        }],
        transaction
      });

      if (!pedido) {
        logger.warn(`Cancelación fallida - Pedido no encontrado: ID ${pedidoId}`);
        throw new Error('Pedido no encontrado');
      }

      if (!['pendiente', 'confirmado'].includes(pedido.estado_pedido)) {
        logger.warn(`Intento de cancelar pedido no válido - ID ${pedidoId}`);
        throw new Error('Este pedido no puede ser cancelado');
      }

      if (isVendor) {
        const productos = pedido.Productos || [];
        const esDelVendedor = productos.some(p => p.vendedor_id === userId);
        if (!esDelVendedor) {
          logger.warn(`Vendedor no autorizado para cancelar pedido ID ${pedidoId}`);
          throw new Error('No autorizado: este pedido no pertenece a este vendedor');
        }
      } else {
        if (pedido.usuario_id !== userId) {
          logger.warn(`Usuario no autorizado para cancelar pedido ID ${pedidoId}`);
          throw new Error('No autorizado: este pedido no pertenece a este usuario');
        }
      }

      await pedido.update({ estado_pedido: 'cancelado' }, { transaction });
      await transaction.commit();
      logger.info(`Pedido cancelado - ID: ${pedidoId}, Por: ${isVendor ? 'vendedor' : 'usuario'} ID ${userId}`);
      return pedido;

    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al cancelar pedido ID ${pedidoId}: ${error.message}`);
      throw error;
    }
  },

  // Historial de pedidos por usuario
  async getOrderHistory(userId) {
    try {
      const pedidos = await db.Order.findAll({
        where: { usuario_id: userId },
        include: [{
          model: db.Product,
          as: 'Productos',
          include: [{
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id', 'nombre']
          }]
        }],
        order: [['createdAt', 'DESC']],
        paranoid: false
      });

      logger.info(`Historial de pedidos obtenido para usuario ID: ${userId}`);
      return pedidos;
    } catch (error) {
      logger.error(`Error al obtener historial de pedidos para usuario ${userId}: ${error.message}`);
      throw error;
    }
  },

  // Pedidos por vendedor
  async getVendorOrders(vendorId) {
    try {
      const pedidos = await db.Order.findAll({
        include: [{
          model: db.Product,
          as: 'Productos',
          where: { vendedor_id: vendorId },
          include: [{
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id', 'nombre']
          }]
        }, {
          model: db.User,
          as: 'Usuario',
          attributes: ['user_id', 'nombre']
        }],
        order: [['createdAt', 'DESC']],
        paranoid: false
      });

      logger.info(`Pedidos del vendedor ID ${vendorId} obtenidos`);
      return pedidos;
    } catch (error) {
      logger.error(`Error al obtener pedidos del vendedor ${vendorId}: ${error.message}`);
      throw error;
    }
  },

  // Marcar como entregado (Vendedor)
  async markAsDelivered(vendorId, pedidoId) {
    const transaction = await db.sequelize.transaction();

    try {
      const pedido = await db.Order.findOne({
        where: {
          pedido_id: pedidoId,
          estado_pedido: 'confirmado'
        },
        include: [{
          model: db.Product,
          as: 'Productos',
          where: { vendedor_id: vendorId },
          through: { attributes: ['cantidad'] }
        }],
        transaction
      });

      if (!pedido) {
        logger.warn(`No se puede marcar como entregado - Pedido no encontrado o no confirmado: ID ${pedidoId}`);
        throw new Error('Pedido no encontrado o no confirmado');
      }

      for (const producto of pedido.Productos) {
        const cantidad = producto.OrderItem.cantidad;

        await db.Product.update(
          {
            cantidad_disponible: db.sequelize.literal(`cantidad_disponible - ${cantidad}`),
            cantidad_vendida: db.sequelize.literal(`cantidad_vendida + ${cantidad}`)
          },
          {
            where: { producto_id: producto.producto_id },
            transaction
          }
        );
      }

      const updatedPedido = await pedido.update({
        estado_pedido: 'entregado',
        venta_realizada: true
      }, { transaction });

      await transaction.commit();
      logger.info(`Pedido entregado - ID: ${pedidoId}, Vendedor: ${vendorId}`);
      return updatedPedido;

    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al marcar como entregado pedido ID ${pedidoId}: ${error.message}`);
      throw error;
    }
  }
};

module.exports = orderService;