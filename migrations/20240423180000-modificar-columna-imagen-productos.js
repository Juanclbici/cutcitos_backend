'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'imagen', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'default_product.png',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'imagen', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'default_product.png',
    });
  }
};
