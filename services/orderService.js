const db = require('../models');
const { Op } = require('sequelize');

const orderService = {
  // Crear nuevo pedido (Estudiante)
  async createOrder(userId, { producto_id, cantidad, metodo_pago, direccion_entrega }) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // 1. Verificar producto
      const producto = await db.Product.findByPk(producto_id, { transaction });
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      if (producto.cantidad_disponible < cantidad) {
        throw new Error('Cantidad no disponible');
      }

      // 2. Calcular total
      const total = producto.precio * cantidad;

      // 3. Crear pedido
      const pedido = await db.Order.create({
        usuario_id: userId,
        producto_id,
        cantidad,
        total,
        metodo_pago,
        direccion_entrega,
        estado_pedido: 'pendiente'
      }, { transaction });

      // 4. Actualizar producto
      await producto.update({
        cantidad_disponible: producto.cantidad_disponible - cantidad,
        cantidad_vendida: producto.cantidad_vendida + cantidad
      }, { transaction });

      await transaction.commit();
      return pedido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Confirmar pedido (Vendedor)
  async confirmOrder(vendorId, pedidoId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // 1. Buscar pedido y producto relacionado
      const pedido = await db.Order.findOne({
        where: { pedido_id: pedidoId },
        include: [{
          model: db.Product,
          as: 'Producto',
          where: { vendedor_id: vendorId }
        }],
        transaction
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado o no autorizado');
      }
      
      if (pedido.estado_pedido !== 'pendiente') {
        throw new Error('El pedido no está pendiente');
      }

      // 2. Actualizar pedido
      await pedido.update({
        estado_pedido: 'confirmado',
        vendedor_confirmado: true,
        fecha_confirmacion_vendedor: new Date()
      }, { transaction });

      await transaction.commit();
      return pedido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Cancelar pedido (Estudiante o Vendedor con validaciones)
  async cancelOrder(userId, pedidoId, isVendor = false) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const whereClause = { pedido_id: pedidoId };
      
      if (isVendor) {
        whereClause[Op.and] = [
          { estado_pedido: 'pendiente' },
          { '$Producto.vendedor_id$': userId }
        ];
      } else {
        whereClause.usuario_id = userId;
        whereClause.estado_pedido = { [Op.in]: ['pendiente', 'confirmado'] };
      }

      const pedido = await db.Order.findOne({
        where: whereClause,
        include: isVendor ? [{ model: db.Product, as: 'Producto' }] : [],
        transaction
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado o no se puede cancelar');
      }

      // Actualizar estado
      await pedido.update({ estado_pedido: 'cancelado' }, { transaction });

      // Revertir cantidades en producto si está pendiente
      if (pedido.estado_pedido === 'pendiente') {
        await db.Product.update(
          {
            cantidad_disponible: db.sequelize.literal(`cantidad_disponible + ${pedido.cantidad}`),
            cantidad_vendida: db.sequelize.literal(`cantidad_vendida - ${pedido.cantidad}`)
          },
          {
            where: { producto_id: pedido.producto_id },
            transaction
          }
        );
      }

      await transaction.commit();
      return pedido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Historial de pedidos por usuario
  async getOrderHistory(userId) {
    return await db.Order.findAll({
      where: { usuario_id: userId },
      include: [
        {
          model: db.Product,
          as: 'Producto',
          include: [{
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id', 'nombre']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      paranoid: false // Para incluir pedidos eliminados lógicamente
    });
  },

  // Pedidos por vendedor
  async getVendorOrders(vendorId) {
    return await db.Order.findAll({
      include: [{
        model: db.Product,
        as: 'Producto',
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
          as: 'Producto',
          where: { vendedor_id: vendorId }
        }],
        transaction
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado o no confirmado');
      }

      const updatedPedido = await pedido.update({
        estado_pedido: 'entregado',
        venta_realizada: true
      }, { transaction });

      await transaction.commit();
      return updatedPedido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Reportes de ventas para vendedores
  async getSalesReports(vendorId, startDate, endDate) {
    return await db.Order.findAll({
      where: {
        estado_pedido: 'entregado',
        venta_realizada: true,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: db.Product,
        as: 'Producto',
        where: { vendedor_id: vendorId },
        attributes: ['nombre', 'precio']
      }],
      attributes: [
        'producto_id',
        [db.sequelize.fn('SUM', db.sequelize.col('cantidad')), 'total_vendido'],
        [db.sequelize.fn('SUM', db.sequelize.col('total')), 'ingresos_totales']
      ],
      group: ['producto_id'],
      raw: true
    });
  }
};

module.exports = orderService;