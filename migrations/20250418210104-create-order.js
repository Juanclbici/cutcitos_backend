'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      pedido_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      usuario_id: { type: Sequelize.INTEGER, allowNull: false },
      vendedor_id: { type: Sequelize.INTEGER, allowNull: false },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      estado_pedido: { type: Sequelize.ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'), defaultValue: 'pendiente' },
      metodo_pago: { type: Sequelize.STRING, allowNull: false },
      direccion_entrega: { type: Sequelize.STRING, allowNull: false },
      vendedor_confirmado: { type: Sequelize.BOOLEAN, defaultValue: false },
      venta_realizada: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Orders');
  }
};
