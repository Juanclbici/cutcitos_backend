const Pedido = require('../models/order');
const Producto = require('../models/product');
const { Op } = require('sequelize');

const orderService = {
    // Crear nuevo pedido (Estudiante)
    async createOrder(userId, { producto_id, cantidad, metodo_pago, direccion_entrega }) {
        // 1. Verificar producto
        const producto = await Producto.findByPk(producto_id);
        if (!producto) throw new Error('Producto no encontrado');
        if (producto.cantidad_disponible < cantidad) throw new Error('Cantidad no disponible');
    
        // 2. Calcular total
        const total = producto.precio * cantidad;
    
        // 3. Crear pedido
        const pedido = await Pedido.create({
          usuario_id: userId,
          producto_id,
          cantidad,
          total,
          metodo_pago,
          direccion_entrega,
          estado_pedido: 'pendiente'
        });
    
        // 4. Actualizar producto
        await Producto.update(
          { 
            cantidad_disponible: producto.cantidad_disponible - cantidad,
            cantidad_vendida: producto.cantidad_vendida + cantidad
          },
          { where: { producto_id } }
        );
    
        return pedido;
      },
    
      // Confirmar pedido (Vendedor)
      async confirmOrder(vendorId, pedidoId) {
        // 1. Buscar pedido y producto relacionado
        const pedido = await Pedido.findOne({
          where: { pedido_id: pedidoId },
          include: {
            model: Producto,
            where: { vendedor_id: vendorId }
          }
        });
    
        if (!pedido) throw new Error('Pedido no encontrado o no autorizado');
        if (pedido.estado_pedido !== 'pendiente') throw new Error('El pedido no está pendiente');
    
        // 2. Actualizar pedido
        const updatedPedido = await pedido.update({
          estado_pedido: 'confirmado',
          vendedor_confirmado: true,
          fecha_confirmacion_vendedor: new Date()
        });
    
        return updatedPedido;
      },

  // Cancelar pedido (Estudiante o Vendedor con validaciones)
  async cancelOrder(userId, pedidoId, isVendor = false) {
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

    const pedido = await Pedido.findOne({
      where: whereClause,
      include: isVendor ? [{ model: Producto }] : []
    });

    if (!pedido) throw new Error('Pedido no encontrado o no se puede cancelar');

    // Actualizar estado
    await pedido.update({ estado_pedido: 'cancelado' });

    // Revertir cantidades en producto si está pendiente
    if (pedido.estado_pedido === 'pendiente') {
      await Producto.update(
        {
          cantidad_disponible: sequelize.literal(`cantidad_disponible + ${pedido.cantidad}`),
          cantidad_vendida: sequelize.literal(`cantidad_vendida - ${pedido.cantidad}`)
        },
        { where: { producto_id: pedido.producto_id } }
      );
    }

    return pedido;
  },

  // Historial de pedidos por usuario
  async getOrderHistory(userId) {
    return await Pedido.findAll({
      where: { usuario_id: userId },
      include: [{ model: Producto }],
      order: [['fecha_pedido', 'DESC']]
    });
  },

  // Pedidos por vendedor
  async getVendorOrders(vendorId) {
    return await Pedido.findAll({
      include: [{
        model: Producto,
        where: { vendedor_id: vendorId }
      }],
      order: [['fecha_pedido', 'DESC']]
    });
  },

  // Marcar como entregado (Vendedor)
  async markAsDelivered(vendorId, pedidoId) {
    const pedido = await Pedido.findOne({
      where: { pedido_id: pedidoId, estado_pedido: 'confirmado' },
      include: {
        model: Producto,
        where: { vendedor_id: vendorId }
      }
    });

    if (!pedido) throw new Error('Pedido no encontrado o no confirmado');

    const updatedPedido = await pedido.update({
      estado_pedido: 'entregado',
      venta_realizada: true
    });

    return updatedPedido;
  },

  // Reportes de ventas para vendedores
  async getSalesReports(vendorId, startDate, endDate) {
    return await Pedido.findAll({
      where: {
        estado_pedido: 'entregado',
        venta_realizada: true,
        fecha_pedido: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Producto,
        where: { vendedor_id: vendorId },
        attributes: ['nombre', 'precio']
      }],
      attributes: [
        'producto_id',
        [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
        [sequelize.fn('SUM', sequelize.col('total')), 'ingresos_totales']
      ],
      group: ['producto_id']
    });
  }
};

module.exports = orderService;