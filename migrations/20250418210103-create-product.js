'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      producto_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING, allowNull: false },
      descripcion: { type: Sequelize.TEXT },
      precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      cantidad_disponible: { type: Sequelize.INTEGER, defaultValue: 0 },
      cantidad_vendida: { type: Sequelize.INTEGER, defaultValue: 0 },
      imagen: { type: Sequelize.STRING },
      fecha_publicacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      estado_producto: { type: Sequelize.ENUM('disponible', 'agotado', 'inactivo'), defaultValue: 'disponible' },
      categoria_id: { type: Sequelize.INTEGER },
      vendedor_id: { type: Sequelize.INTEGER },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Products');
  }
};
