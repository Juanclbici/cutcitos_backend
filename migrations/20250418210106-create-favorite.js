'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Favorites', {
      favorito_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      usuario_id: { type: Sequelize.INTEGER },
      producto_id: { type: Sequelize.INTEGER },
      fecha_agregado: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Favorites');
  }
};
