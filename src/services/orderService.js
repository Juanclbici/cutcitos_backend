const db = require('../models');
const { Op } = require('sequelize');

const orderService = {
  // Crear nuevo pedido (Estudiante)
  async createOrder(user_id, vendedor_id, productos, metodo_pago, direccion_entrega) {
    const transaction = await db.sequelize.transaction();
    
    try {
      let total = 0;
      
      for (const item of productos) {
        const producto = await db.Product.findByPk(item.producto_id, { transaction });
        if (!producto) throw new Error(`Producto ID ${item.producto_id} no encontrado`);
        if (producto.cantidad_disponible < item.cantidad)
          throw new Error(`Stock insuficiente para producto ID ${item.producto_id}`);
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
      return nuevaOrden;
  
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
          as: 'Productos',
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
      // Traer el pedido con productos
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
        throw new Error('Pedido no encontrado');
      }
  
      // Validar que esté cancelable
      if (!['pendiente', 'confirmado'].includes(pedido.estado_pedido)) {
        throw new Error('Este pedido no puede ser cancelado');
      }
  
      // Verificar permisos
      if (isVendor) {
        const productos = pedido.Productos || [];
        const esDelVendedor = productos.some(p => p.vendedor_id === userId);
        if (!esDelVendedor) {
          throw new Error('No autorizado: este pedido no pertenece a este vendedor');
        }
      } else {
        if (pedido.usuario_id !== userId) {
          throw new Error('No autorizado: este pedido no pertenece a este usuario');
        }
      }
  
      // Cancelar pedido
      await pedido.update({ estado_pedido: 'cancelado' }, { transaction });
  
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
          as: 'Productos',
          include: [{
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id', 'nombre']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      paranoid: false
    });
  },

  // Pedidos por vendedor
  async getVendorOrders(vendorId) {
    return await db.Order.findAll({
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
        include: [
          {
            model: db.Product,
            as: 'Productos',
            where: { vendedor_id: vendorId },
            through: { attributes: ['cantidad'] } 
          }
        ],
        transaction
      });
  
      if (!pedido) {
        throw new Error('Pedido no encontrado o no confirmado');
      }
  
      // Actualizar cada producto
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
  
      // Actualizar el estado del pedido
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
  
};

module.exports = orderService;