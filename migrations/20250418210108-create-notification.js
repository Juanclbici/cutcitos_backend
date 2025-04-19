'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      notificacion_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tipo_notificacion: { type: Sequelize.STRING, allowNull: false },
      mensaje: { type: Sequelize.TEXT, allowNull: false },
      fecha_envio: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      estado_notificacion: { type: Sequelize.ENUM('no_leida', 'leida'), defaultValue: 'no_leida' },
      usuario_id: { type: Sequelize.INTEGER }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Notifications');
  }
};
