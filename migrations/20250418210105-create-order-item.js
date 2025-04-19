'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderItems', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false },
      producto_id: { type: Sequelize.INTEGER, allowNull: false },
      cantidad: { type: Sequelize.INTEGER, allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('OrderItems');
  }
};
