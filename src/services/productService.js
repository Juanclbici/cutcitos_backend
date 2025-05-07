const db = require('../models');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productService = {
  async createProduct(vendorId, { nombre, descripcion, precio, cantidad_disponible, imagen, categoria_id }) {
    try {
      const category = await db.Category.findByPk(categoria_id);
      if (!category) {
        logger.warn(`Categoría no encontrada para nuevo producto`);
        throw new Error('La categoría especificada no existe');
      }

      if (!nombre || !precio) {
        logger.warn(`Datos incompletos al crear producto por vendedor ID ${vendorId}`);
        throw new Error('Nombre y precio son requeridos');
      }

      const product = await db.Product.create({
        nombre,
        descripcion: descripcion || null,
        precio,
        cantidad_disponible: cantidad_disponible || 0,
        imagen: imagen || null,
        categoria_id,
        vendedor_id: vendorId,
        estado_producto: 'disponible'
      });

      logger.info(`Producto creado: ${nombre}, Vendedor ID: ${vendorId}`);
      return product;
    } catch (error) {
      logger.error(`Error al crear producto: ${error.message}`);
      throw error;
    }
  },

  async getProductById(productId) {
    try {
      const product = await db.Product.findByPk(productId, {
        include: [
          { model: db.User, as: 'Vendedor', attributes: ['user_id', 'nombre', 'email'] },
          { model: db.Category, as: 'Categoria', attributes: ['categoria_id', 'nombre'] }
        ]
      });

      if (!product) {
        logger.warn(`Producto no encontrado - ID: ${productId}`);
        throw new Error('Producto no encontrado');
      }

      logger.info(`Producto consultado - ID: ${productId}`);
      return product;
    } catch (error) {
      logger.error(`Error al obtener producto ${productId}: ${error.message}`);
      throw error;
    }
  },

  async getProductsByCategoryId(categoriaId) {
    try {
      const category = await db.Category.findByPk(categoriaId);
      if (!category) {
        logger.warn(`Intento de consulta por categoría inexistente - ID: ${categoriaId}`);
        throw new Error('Categoría no encontrada');
      }

      const products = await db.Product.findAll({
        where: { categoria_id: categoriaId, estado_producto: 'disponible' },
        include: [
          { model: db.User, as: 'Vendedor', attributes: ['user_id', 'nombre'] },
          { model: db.Category, as: 'Categoria', attributes: ['categoria_id', 'nombre'] }
        ],
        order: [['fecha_publicacion', 'DESC']]
      });

      logger.info(`Productos obtenidos por categoría - ID: ${categoriaId}`);
      return products;
    } catch (error) {
      logger.error(`Error al obtener productos por categoría ${categoriaId}: ${error.message}`);
      throw error;
    }
  },

  async updateProduct(productId, updateData) {
    try {
      const product = await db.Product.findByPk(productId);
      if (!product) {
        logger.warn(`Intento de actualizar producto inexistente - ID: ${productId}`);
        throw new Error('Producto no encontrado');
      }

      if (updateData.imagen && updateData.imagen !== product.imagen) {
        const isOldCloudinaryImage = product.imagen?.startsWith('http') && !product.imagen.includes('default_product.png');
        if (isOldCloudinaryImage) {
          try {
            const publicId = product.imagen.split('/').slice(-2).join('/').replace(/\.(jpg|jpeg|png|webp)/, '');
            await cloudinary.uploader.destroy(publicId);
            logger.info(`Imagen anterior del producto eliminada: ${publicId}`);
          } catch (error) {
            logger.warn(`Error al eliminar imagen anterior: ${error.message}`);
          }
        }
      }

      const datosActualizados = {
        ...updateData,
        imagen: updateData.imagen || product.imagen,
      };

      await product.update(datosActualizados);
      logger.info(`Producto actualizado - ID: ${productId}`);
      return await db.Product.findByPk(productId);
    } catch (error) {
      logger.error(`Error al actualizar producto ${productId}: ${error.message}`);
      throw error;
    }
  },

  async deleteProduct(productId, vendorId) {
    try {
      const product = await db.Product.findOne({
        where: { producto_id: productId, vendedor_id: vendorId }
      });

      if (!product) {
        logger.warn(`Producto no encontrado o no autorizado - ID: ${productId}`);
        throw new Error('Producto no encontrado o no autorizado');
      }

      const ordersCount = await db.Order.count({
        where: { producto_id: productId }
      });

      if (ordersCount > 0) {
        logger.warn(`Intento de eliminar producto con órdenes - ID: ${productId}`);
        throw new Error('No se puede eliminar un producto con órdenes asociadas');
      }

      await product.destroy();
      logger.info(`Producto eliminado - ID: ${productId}`);
      return { success: true, message: 'Producto eliminado correctamente' };
    } catch (error) {
      logger.error(`Error al eliminar producto ${productId}: ${error.message}`);
      throw error;
    }
  },

  async getVendorProducts(vendorId) {
    try {
      const products = await db.Product.findAll({
        where: { vendedor_id: vendorId },
        include: [{ model: db.Category, as: 'Categoria', attributes: ['categoria_id', 'nombre'] }],
        order: [['fecha_publicacion', 'DESC']]
      });

      logger.info(`Productos del vendedor ID ${vendorId} consultados`);
      return products;
    } catch (error) {
      logger.error(`Error al obtener productos del vendedor ${vendorId}: ${error.message}`);
      throw error;
    }
  },

  async getAllAvailableProducts() {
    try {
      const products = await db.Product.findAll({
        where: { estado_producto: 'disponible' },
        include: [
          { model: db.User, as: 'Vendedor', attributes: ['user_id', 'nombre'] },
          { model: db.Category, as: 'Categoria', attributes: ['categoria_id', 'nombre'] }
        ],
        order: [['fecha_publicacion', 'DESC']]
      });

      logger.info(`Consulta de productos disponibles realizada`);
      return products;
    } catch (error) {
      logger.error(`Error al obtener productos disponibles: ${error.message}`);
      throw error;
    }
  },

  async searchProducts(searchTerm, categoryId = null) {
    try {
      const options = {
        where: {
          estado_producto: 'disponible',
          [db.Sequelize.Op.or]: [
            { nombre: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
            { descripcion: { [db.Sequelize.Op.like]: `%${searchTerm}%` } }
          ]
        },
        include: [{ model: db.Category, as: 'Categoria', attributes: ['categoria_id', 'nombre'] }]
      };

      if (categoryId) {
        options.where.categoria_id = categoryId;
      }

      const results = await db.Product.findAll(options);
      logger.info(`Búsqueda de productos realizada - término: "${searchTerm}", categoría: ${categoryId || 'todas'}`);
      return results;
    } catch (error) {
      logger.error(`Error en búsqueda de productos: ${error.message}`);
      throw error;
    }
  }
};

module.exports = productService;