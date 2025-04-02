const Product = require('../models/product');

const productService = {
  async createProduct(vendorId, productData) {
    const product = await Product.create({
      ...productData,
      vendedor_id: vendorId
    });
    return product;
  },

  async getProductById(productId) {
    return await Product.findByPk(productId);
  },

  async updateProduct(productId, vendorId, updateData) {
    const product = await Product.findOne({
      where: {
        producto_id: productId,
        vendedor_id: vendorId
      }
    });

    if (!product) throw new Error('Producto no encontrado o no autorizado');

    return await product.update(updateData);
  },

  async deleteProduct(productId, vendorId) {
    const product = await Product.findOne({
      where: {
        producto_id: productId,
        vendedor_id: vendorId
      }
    });

    if (!product) throw new Error('Producto no encontrado o no autorizado');

    await product.destroy();
    return { success: true };
  },

  async getVendorProducts(vendorId) {
    return await Product.findAll({
      where: { vendedor_id: vendorId }
    });
  },

  async getAllAvailableProducts() {
    return await Product.findAll({
      where: { estado_producto: 'disponible' }
    });
  }
};

module.exports = productService;