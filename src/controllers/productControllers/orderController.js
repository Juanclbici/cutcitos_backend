const orderService = require('../../services/orderService');
const { Product, Order } = require('../../models');

// Crear pedido (Estudiante)
exports.createOrder = async (req, res) => {
  try {
    const { vendedor_id, productos, metodo_pago, direccion_entrega } = req.body;
    const user_id = req.user.id;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un producto' });
    }

    const nuevaOrden = await orderService.createOrder(
      user_id,
      vendedor_id,
      productos,
      metodo_pago,
      direccion_entrega
    );

    res.status(201).json({ success: true, order_id: nuevaOrden.pedido_id });
  } catch (error) {
    console.error("Error al crear pedido:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirmar pedido (Vendedor)
exports.confirmOrder = async (req, res) => {
    try {
      const pedido = await orderService.confirmOrder(req.user.id, req.params.pedidoId);
      res.json({
        success: true,
        message: 'Pedido confirmado exitosamente',
        data: pedido
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

// Cancelar pedido
exports.cancelOrder = async (req, res) => {
  try {
    const isVendor = req.user.rol === 'seller';
    const pedido = await orderService.cancelOrder(req.user.id, req.params.pedidoId, isVendor);
    res.json({
      success: true,
      message: 'Pedido cancelado exitosamente',
      data: pedido
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Historial de pedidos
exports.getOrderHistory = async (req, res) => {
  try {
    const pedidos = await orderService.getOrderHistory(req.user.id);
    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Pedidos por vendedor
exports.getVendorOrders = async (req, res) => {
  try {
    const pedidos = await orderService.getVendorOrders(req.user.id);
    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Marcar como entregado
exports.markAsDelivered = async (req, res) => {
  try {
    const pedido = await orderService.markAsDelivered(req.user.id, req.params.pedidoId);
    res.json({
      success: true,
      message: 'Pedido marcado como entregado',
      data: pedido
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
