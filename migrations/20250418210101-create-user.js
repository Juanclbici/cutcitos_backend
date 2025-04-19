'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      rol: { type: Sequelize.ENUM('admin', 'seller', 'buyer'), defaultValue: 'buyer' },
      foto_perfil: { type: Sequelize.STRING, defaultValue: 'default.jpg' },
      telefono: { type: Sequelize.STRING },
      estado_cuenta: { type: Sequelize.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
      codigo_udg: {type: Sequelize.STRING,unique: true},
      reset_password_token: {type: Sequelize.STRING,allowNull: true},
      reset_password_expires: {type: Sequelize.DATE,allowNull: true},
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  }
};
