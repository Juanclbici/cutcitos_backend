const orderService = require('../../services/orderService');
const { Product, Order } = require('../../models');
const logger = require('../../utils/logger');

// Crear pedido (Estudiante)
exports.createOrder = async (req, res) => {
  try {
    const { vendedor_id, productos, metodo_pago, direccion_entrega } = req.body;
    const user_id = req.user.id;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      logger.warn(`Intento de crear pedido sin productos - usuario ID: ${user_id}`);
      return res.status(400).json({ message: 'Se requiere al menos un producto' });
    }

    const nuevaOrden = await orderService.createOrder(
      user_id,
      vendedor_id,
      productos,
      metodo_pago,
      direccion_entrega
    );

    logger.info(`Pedido creado con ID ${nuevaOrden.pedido_id} por usuario ID ${user_id}`);
    res.status(201).json({ success: true, order_id: nuevaOrden.pedido_id });
  } catch (error) {
    logger.error(`Error al crear pedido: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirmar pedido (Vendedor)
exports.confirmOrder = async (req, res) => {
  try {
    const pedido = await orderService.confirmOrder(req.user.id, req.params.pedidoId);
    logger.info(`Pedido confirmado ID ${req.params.pedidoId} por vendedor ID ${req.user.id}`);
    res.json({
      success: true,
      message: 'Pedido confirmado exitosamente',
      data: pedido
    });
  } catch (error) {
    logger.warn(`Confirmación fallida para pedido ID ${req.params.pedidoId}: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cancelar pedido
exports.cancelOrder = async (req, res) => {
  try {
    const isVendor = req.user.rol === 'seller';
    const pedido = await orderService.cancelOrder(req.user.id, req.params.pedidoId, isVendor);
    logger.info(`Pedido cancelado ID ${req.params.pedidoId} por usuario ID ${req.user.id}`);
    res.json({ success: true, message: 'Pedido cancelado exitosamente', data: pedido });
  } catch (error) {
    logger.warn(`Cancelación fallida para pedido ID ${req.params.pedidoId}: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Historial de pedidos
exports.getOrderHistory = async (req, res) => {
  try {
    const pedidos = await orderService.getOrderHistory(req.user.id);
    logger.info(`Historial de pedidos consultado por usuario ID ${req.user.id}`);
    res.json({ success: true, data: pedidos });
  } catch (error) {
    logger.error(`Error al obtener historial de pedidos: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Pedidos por vendedor
exports.getVendorOrders = async (req, res) => {
  try {
    const pedidos = await orderService.getVendorOrders(req.user.id);
    logger.info(`Pedidos del vendedor ID ${req.user.id} consultados`);
    res.json({ success: true, data: pedidos });
  } catch (error) {
    logger.error(`Error al obtener pedidos del vendedor: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Marcar como entregado
exports.markAsDelivered = async (req, res) => {
  try {
    const pedido = await orderService.markAsDelivered(req.user.id, req.params.pedidoId);
    logger.info(`Pedido marcado como entregado ID ${req.params.pedidoId} por vendedor ID ${req.user.id}`);
    res.json({ success: true, message: 'Pedido marcado como entregado', data: pedido });
  } catch (error) {
    logger.warn(`Error al marcar como entregado pedido ID ${req.params.pedidoId}: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};