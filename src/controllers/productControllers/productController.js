const productService = require('../../services/productService');
const logger = require('../../utils/logger');

// Agregar producto
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.user.id, req.body);
    logger.info(`Producto creado por usuario ID ${req.user.id} - ID: ${product.producto_id}`);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    logger.error(`Error al crear producto - Usuario ID: ${req.user.id} - ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Obtener los productos
exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
      logger.warn(`Producto no encontrado - ID: ${req.params.productId}`);
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    logger.info(`Producto consultado - ID: ${req.params.productId}`);
    res.json({ success: true, data: product });
  } catch (error) {
    logger.error(`Error al obtener producto - ID: ${req.params.productId} - ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};


// Actualizar producto
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.productId, req.body);
    logger.info(`Producto actualizado - ID: ${req.params.productId}`);
    res.json({ success: true, data: product });
  } catch (error) {
    logger.error(`Error al actualizar producto - ID: ${req.params.productId} - ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.productId, req.user.id);
    logger.info(`Producto eliminado - ID: ${req.params.productId}, por Usuario ID: ${req.user.id}`);
    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error) {
    logger.warn(`Error al eliminar producto - ID: ${req.params.productId} - ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Ontener productos de un vendedor
exports.getVendorProducts = async (req, res) => {
  try {
    const products = await productService.getVendorProducts(req.user.id);
    logger.info(`Productos del vendedor consultados - ID Vendedor: ${req.user.id}`);
    res.json({ success: true, data: products });
  } catch (error) {
    logger.error(`Error al obtener productos del vendedor - ID: ${req.user.id} - ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Obtener todos los productos de todos los vendedores
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllAvailableProducts();
    logger.info('Listado de todos los productos disponibles consultado');
    res.json({ success: true, data: products });
  } catch (error) {
    logger.error(`Error al obtener productos disponibles: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Obtener los productos filtrados por categoría
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await productService.getProductsByCategoryId(req.params.categoryId);
    logger.info(`Productos consultados por categoría ID: ${req.params.categoryId}`);
    res.json({ success: true, data: products });
  } catch (error) {
    logger.error(`Error al obtener productos por categoría ${req.params.categoryId}: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};