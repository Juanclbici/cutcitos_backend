const db = require('../models');
const logger = require('../utils/logger');

const categoryService = {
  async createCategory({ nombre, descripcion, imagen }) {
    const existingCategory = await db.Category.findOne({ 
      where: { nombre },
      paranoid: false
    });
    
    if (existingCategory) {
      logger.warn(`Intento de crear categoría duplicada: ${nombre}`);
      throw new Error('Ya existe una categoría con ese nombre');
    }

    const newCategory = await db.Category.create({
      nombre,
      descripcion: descripcion || null,
      imagen: imagen || null,
      activa: true
    });

    logger.info(`Categoría creada: ${nombre}`);
    return newCategory;
  },

  async getAllCategories() {
    try {
      const categories = await db.Category.findAll({
        attributes: ['categoria_id', 'nombre', 'descripcion', 'imagen'],
        order: [['nombre', 'ASC']],
        paranoid: false
      });

      logger.info('Listado de todas las categorías obtenido');
      return categories;
    } catch (error) {
      logger.error(`Error al obtener categorías: ${error.message}`);
      throw error;
    }
  },

  async getCategoryById(id) {
    try {
      const options = {
        where: { categoria_id: id },
        attributes: ['categoria_id', 'nombre', 'descripcion', 'imagen'],
        paranoid: false
      };
  
      const category = await db.Category.findOne(options);
      
      if (!category) {
        logger.warn(`Categoría no encontrada con ID: ${id}`);
        throw new Error('Categoría no encontrada');
      }

      logger.info(`Categoría consultada con ID: ${id}`);
      return category;
    } catch (error) {
      logger.error(`Error al obtener categoría con ID ${id}: ${error.message}`);
      throw error;
    }
  }
};

module.exports = categoryService;