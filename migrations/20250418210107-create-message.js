'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      mensaje_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      mensaje: { type: Sequelize.TEXT, allowNull: false },
      fecha_envio: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      estado_mensaje: { type: Sequelize.ENUM('enviado', 'recibido', 'leido'), defaultValue: 'enviado' },
      usuario_id: { type: Sequelize.INTEGER },
      vendedor_id: { type: Sequelize.INTEGER }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Messages');
  }
};
