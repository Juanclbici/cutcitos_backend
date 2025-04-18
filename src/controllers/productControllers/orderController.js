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

    const total = await calcularTotal(productos);

    const nuevaOrden = await Order.create({
      usuario_id: user_id, 
      vendedor_id,
      total,
      estado_pedido: 'pendiente', 
      metodo_pago,
      direccion_entrega
    });
    
    
    for (const item of productos) {
      await nuevaOrden.addProducto(item.producto_id, { through: { cantidad: item.cantidad } });
    }

    res.status(201).json({ success: true, order_id: nuevaOrden.pedido_id });

  } catch (error) {
    console.error("Error al crear pedido :/ :", error);
    res.status(500).json({ success: false, message: 'Error al crear el pedido X/' });
  }
};

// Función auxiliar para sumar precios
async function calcularTotal(productos) {
  let total = 0;
  for (const { producto_id, cantidad } of productos) {
    const producto = await Product.findByPk(producto_id);
    if (producto) {
      total += producto.precio * cantidad;
    }
  }
  return total;
}


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