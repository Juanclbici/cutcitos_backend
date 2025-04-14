const db = require('../models');

const productService = {
  async createProduct(vendorId, { 
    nombre, 
    descripcion, 
    precio, 
    cantidad_disponible, 
    imagen, 
    categoria_id 
  }) {
    try {
      // 1. Validar que la categoría exista
      const category = await db.Category.findByPk(categoria_id);
      if (!category) {
        throw new Error('La categoría especificada no existe');
      }
  
      // 2. Validaciones adicionales
      if (!nombre || !precio) {
        throw new Error('Nombre y precio son requeridos');
      }
  
      // 3. Crear el producto
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
  
      return product;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  async getProductById(productId) {
    try {
      const product = await db.Product.findByPk(productId, {
        include: [
          {
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id', 'nombre', 'email']
          },
          {
            model: db.Category,
            as: 'Categoria',
            attributes: ['categoria_id', 'nombre']
          }
        ]
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return product;
    } catch (error) {
      console.error(`Error al obtener producto con ID ${productId}:`, error);
      throw error;
    }
  },
  async getProductsByCategoryId(categoriaId) {
    try {
      // Verificar que la categoría exista
      const category = await db.Category.findByPk(categoriaId);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }
  
      const products = await db.Product.findAll({
        where: {
          categoria_id: categoriaId,
          estado_producto: 'disponible'
        },
        include: [
          {
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id', 'nombre']
          },
          {
            model: db.Category,
            as: 'Categoria',
            attributes: ['categoria_id', 'nombre']
          }
        ],
        order: [['fecha_publicacion', 'DESC']]
      });
  
      return products;
    } catch (error) {
      console.error(`Error al obtener productos por categoría ${categoriaId}:`, error);
      throw error;
    }
  },  

  async updateProduct(productId, vendorId, updateData) {
    try {
      const product = await db.Product.findOne({
        where: {
          producto_id: productId,
          vendedor_id: vendorId
        }
      });

      if (!product) {
        throw new Error('Producto no encontrado o no autorizado');
      }

      // Validar campos permitidos para actualización
      const allowedFields = [
        'nombre', 
        'descripcion', 
        'precio', 
        'cantidad_disponible', 
        'imagen', 
        'categoria_id',
        'estado_producto'
      ];
      
      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      await product.update(updates);
      return product;
    } catch (error) {
      console.error(`Error al actualizar producto ${productId}:`, error);
      throw error;
    }
  },

  async deleteProduct(productId, vendorId) {
    try {
      const product = await db.Product.findOne({
        where: {
          producto_id: productId,
          vendedor_id: vendorId
        }
      });

      if (!product) {
        throw new Error('Producto no encontrado o no autorizado');
      }

      // Verificar si el producto tiene órdenes asociadas
      const ordersCount = await db.Order.count({
        where: { producto_id: productId }
      });

      if (ordersCount > 0) {
        throw new Error('No se puede eliminar un producto con órdenes asociadas');
      }

      await product.destroy();
      return { success: true, message: 'Producto eliminado correctamente' };
    } catch (error) {
      console.error(`Error al eliminar producto ${productId}:`, error);
      throw error;
    }
  },

  async getVendorProducts(vendorId) {
    try {
      return await db.Product.findAll({
        where: { vendedor_id: vendorId },
        include: [
          {
            model: db.Category,
            as: 'Categoria',
            attributes: ['categoria_id', 'nombre']
          }
        ],
        order: [['fecha_publicacion', 'DESC']]
      });
    } catch (error) {
      console.error(`Error al obtener productos del vendedor ${vendorId}:`, error);
      throw error;
    }
  },

  async getAllAvailableProducts() {
    try {
      return await db.Product.findAll({
        where: { estado_producto: 'disponible' },
        include: [
          {
            model: db.User,
            as: 'Vendedor',
            attributes: ['user_id', 'nombre']
          },
          {
            model: db.Category,
            as: 'Categoria',
            attributes: ['categoria_id', 'nombre']
          }
        ],
        order: [['fecha_publicacion', 'DESC']]
      });
    } catch (error) {
      console.error('Error al obtener productos disponibles:', error);
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
        include: [
          {
            model: db.Category,
            as: 'Categoria',
            attributes: ['categoria_id', 'nombre']
          }
        ]
      };

      if (categoryId) {
        options.where.categoria_id = categoryId;
      }

      return await db.Product.findAll(options);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }
};

module.exports = productService;