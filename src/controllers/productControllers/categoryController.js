const categoryService = require('../../services/categoryService');
const logger = require('../../utils/logger');

exports.createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    logger.info(`Categoría creada desde controlador: ${category.nombre}`);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error(`Error al crear categoría: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error(`Error en getAllCategories: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeInactive } = req.query;
    
    const category = await categoryService.getCategoryById(
      id, 
      includeInactive === 'true'
    );
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.warn(`No se encontró categoría con ID ${req.params.id}`);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};