'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blockchain_blocks', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      block_index: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      timestamp: {
        type: Sequelize.BIGINT,
        allowNull: false
      },

      data: {
        type: Sequelize.JSON,
        allowNull: false
      },

      prev_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },

      hash: {
        type: Sequelize.STRING,
        allowNull: false
      },

      // Opcional: created_at / updated_at
      // Esta tabla no requiere timestamps, pero si los quieres:
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blockchain_blocks');
  }
};
