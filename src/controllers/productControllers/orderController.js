const orderService = require('../../services/orderService');

// Crear pedido (Estudiante)
exports.createOrder = async (req, res) => {
  try {
    const pedido = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: pedido
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
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
    const isVendor = req.user.rol === 'vendedor';
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

// Reportes de ventas
exports.getSalesReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const reportes = await orderService.getSalesReports(req.user.id, startDate, endDate);
    res.json({
      success: true,
      data: reportes
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};