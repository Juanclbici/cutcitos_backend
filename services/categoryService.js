const Category = require('../models/category');

const categoryService = {
  async createCategory(data) {
    return await Category.create(data);
  },

  async getAllCategories() {
    return await Category.findAll();
  },

  async getCategoryById(id) {
    return await Category.findByPk(id);
  },

  async updateCategory(id, updateData) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Categoría no encontrada');
    return await category.update(updateData);
  },

  async deleteCategory(id) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Categoría no encontrada');
    await category.destroy();
    return { success: true };
  }
};

module.exports = categoryService;