const db = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { addRecord } = require("../services/blockchainService");

const orderService = {

  /**
   * Crear nuevo pedido (Estudiante)
   * @param {number} user_id - ID del usuario que realiza el pedido
   * @param {number} vendedor_id - ID del vendedor
   * @param {Array} productos - Array de productos con id y cantidad
   * @param {string} metodo_pago - Método de pago seleccionado
   * @param {string} direccion_entrega - Dirección de entrega
   * @returns {Object} Pedido creado
   */
  async createOrder(user_id, vendedor_id, productos, metodo_pago, direccion_entrega) {
    const transaction = await db.sequelize.transaction();

    try {
      let total = 0;

      // Validar y calcular total de productos
      for (const item of productos) {
        const producto = await db.Product.findByPk(item.producto_id, { transaction });
        if (!producto) throw new Error(`Producto ID ${item.producto_id} no encontrado`);

        // Verificar stock disponible
        if (producto.cantidad_disponible < item.cantidad)
          throw new Error(`Stock insuficiente para producto ID ${item.producto_id}`);

        total += producto.precio * item.cantidad;
      }

      // Crear el pedido en la base de datos
      const nuevaOrden = await db.Order.create({
        usuario_id: user_id,
        vendedor_id,
        total,
        estado_pedido: 'pendiente',
        metodo_pago,
        direccion_entrega
      }, { transaction });

      // Asociar productos al pedido
      for (const item of productos) {
        await nuevaOrden.addProducto(item.producto_id, {
          through: { cantidad: item.cantidad },
          transaction
        });
      }

      await transaction.commit();
      logger.info(`Pedido creado exitosamente - ID: ${nuevaOrden.pedido_id}`);

      return nuevaOrden;

    } catch (error) {
      await transaction.rollback();
      logger.error("Error al crear pedido: " + error.message);
      throw error;
    }
  },

  /**
   * Confirmar pedido (Vendedor)
   * @param {number} vendorId - ID del vendedor que confirma
   * @param {number} pedidoId - ID del pedido a confirmar
   * @returns {Object} Pedido confirmado
   */
  async confirmOrder(vendorId, pedidoId) {
    const transaction = await db.sequelize.transaction();

    try {
      // Buscar pedido con validación de vendedor
      const pedido = await db.Order.findOne({
        where: { pedido_id: pedidoId },
        include: [{
          model: db.Product,
          as: 'Productos',
          where: { vendedor_id: vendorId }
        }],
        transaction
      });

      if (!pedido)
        throw new Error('Pedido no encontrado o no autorizado');

      if (pedido.estado_pedido !== 'pendiente')
        throw new Error('El pedido no está pendiente');

      // Actualizar estado a confirmado
      await pedido.update({
        estado_pedido: 'confirmado',
        vendedor_confirmado: true,
        fecha_confirmacion_vendedor: new Date()
      }, { transaction });

      await transaction.commit();
      logger.info(`Pedido confirmado - ID: ${pedidoId}`);

      return pedido;

    } catch (error) {
      await transaction.rollback();
      logger.error("Error al confirmar pedido: " + error.message);
      throw error;
    }
  },

  /**
   * Cancelar pedido (Usuario o Vendedor)
   * @param {number} userId - ID del usuario que cancela
   * @param {number} pedidoId - ID del pedido a cancelar
   * @param {boolean} isVendor - Indica si quien cancela es vendedor
   * @returns {Object} Pedido cancelado
   */
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

      if (!pedido) throw new Error('Pedido no encontrado');

      // Validar que el pedido pueda ser cancelado
      if (!['pendiente', 'confirmado'].includes(pedido.estado_pedido))
        throw new Error('Este pedido no puede ser cancelado');

      // Validar autorización según quién cancela
      if (isVendor) {
        const productos = pedido.Productos || [];
        const esDelVendedor = productos.some(p => p.vendedor_id === userId);
        if (!esDelVendedor)
          throw new Error('No autorizado: este pedido no pertenece a este vendedor');
      } else {
        if (pedido.usuario_id !== userId)
          throw new Error('No autorizado: este pedido no pertenece a este usuario');
      }

      // Guardar estado anterior para determinar si se crea bloque blockchain
      const estadoAnterior = pedido.estado_pedido;

      await pedido.update({ estado_pedido: 'cancelado' }, { transaction });

      await transaction.commit();
      logger.info(`Pedido cancelado - ID: ${pedidoId}`);

      // BLOCKCHAIN: Solo para cancelaciones CONFIRMADAS (pérdidas importantes)
      if (estadoAnterior === 'confirmado') {
        try {
          await addRecord({
            action: "CANCELACION_CONFIRMADA",
            order_id: pedidoId,
            user_id: pedido.usuario_id,
            vendor_id: isVendor ? userId : null,
            canceled_by: isVendor ? "vendedor" : "cliente",
            monto_perdido: pedido.total,
            razon: "cancelacion_confirmada",
            timestamp_cancelacion: new Date().toISOString(),
            // Información adicional para analytics
            productos_count: pedido.Productos?.length || 0,
            dias_confirmado: Math.floor((new Date() - new Date(pedido.fecha_confirmacion_vendedor)) / (1000 * 60 * 60 * 24))
          });
        } catch (err) {
          logger.error("Blockchain error (CANCELAR): " + err.message);
        }
      }

      return pedido;

    } catch (error) {
      await transaction.rollback();
      logger.error("Error al cancelar pedido: " + error.message);
      throw error;
    }
  },

  /**
   * Marcar pedido como entregado (Vendedor)
   * @param {number} vendorId - ID del vendedor
   * @param {number} pedidoId - ID del pedido a entregar
   * @returns {Object} Pedido actualizado
   */
  async markAsDelivered(vendorId, pedidoId) {
    const transaction = await db.sequelize.transaction();

    try {
      // Buscar pedido confirmado del vendedor
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

      if (!pedido)
        throw new Error('Pedido no encontrado o no confirmado');

      // Actualizar stock de productos vendidos
      for (const producto of pedido.Productos) {
        const cantidad = producto.OrderItem.cantidad;
        await db.Product.update(
          {
            cantidad_disponible: db.sequelize.literal(`cantidad_disponible - ${cantidad}`),
            cantidad_vendida: db.sequelize.literal(`cantidad_vendida + ${cantidad}`)
          },
          { where: { producto_id: producto.producto_id }, transaction }
        );
      }

      // Actualizar estado del pedido a entregado
      const updatedPedido = await pedido.update({
        estado_pedido: 'entregado',
        venta_realizada: true
      }, { transaction });

      await transaction.commit();
      logger.info(`Pedido entregado - ID: ${pedidoId}`);

      // BLOCKCHAIN: Registrar venta completada (evento importante)
      try {
        await addRecord({
          action: "VENTA_COMPLETADA",
          order_id: pedidoId,
          vendor_id: vendorId,
          user_id: pedido.usuario_id,
          total: pedido.total,
          estado_final: "entregado",
          timestamp_entrega: new Date().toISOString(),
          // Información detallada de productos para auditoría
          productos: pedido.Productos.map(p => ({
            producto_id: p.producto_id,
            nombre: p.nombre,
            precio: p.precio,
            cantidad: p.OrderItem.cantidad
          }))
        });
      } catch (err) {
        logger.error("Blockchain error (ENTREGAR): " + err.message);
      }

      return updatedPedido;

    } catch (error) {
      await transaction.rollback();
      logger.error("Error al marcar como entregado: " + error.message);
      throw error;
    }
  },

  /**
   * Obtener historial de pedidos por usuario
   * @param {number} userId - ID del usuario
   * @returns {Array} Lista de pedidos del usuario
   */
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
        paranoid: false // Incluir pedidos eliminados lógicamente
      });

      logger.info(`Historial de pedidos obtenido para usuario ID: ${userId}`);
      return pedidos;
    } catch (error) {
      logger.error(`Error al obtener historial de pedidos para usuario ${userId}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Obtener pedidos por vendedor
   * @param {number} vendorId - ID del vendedor
   * @returns {Array} Lista de pedidos del vendedor
   */
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
        paranoid: false // Incluir pedidos eliminados lógicamente
      });

      logger.info(`Pedidos del vendedor ID ${vendorId} obtenidos`);
      return pedidos;
    } catch (error) {
      logger.error(`Error al obtener pedidos del vendedor ${vendorId}: ${error.message}`);
      throw error;
    }
  }
  
};

module.exports = orderService;