const db = require('../models');

const categoryService = {
  async createCategory({ nombre, descripcion, imagen }) {
    const existingCategory = await db.Category.findOne({ 
      where: { nombre },
      paranoid: false
    });
    
    if (existingCategory) {
      throw new Error('Ya existe una categoría con ese nombre');
    }

    return await db.Category.create({
      nombre,
      descripcion: descripcion || null,
      imagen: imagen || null,
      activa: true
    });
  },

  async getAllCategories() {
    try {
      return await db.Category.findAll({
        attributes: ['categoria_id', 'nombre', 'descripcion', 'imagen'],
        order: [['nombre', 'ASC']],
        paranoid: false
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
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
        throw new Error('Categoría no encontrada');
      }
  
      return category;
    } catch (error) {
      console.error(`Error al obtener categoría con ID ${id}:`, error);
      throw error;
    }
  }

};

module.exports = categoryService;