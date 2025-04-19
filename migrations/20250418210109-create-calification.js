'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Califications', {
      calificacion_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      puntaje: {
        type: Sequelize.INTEGER,
        validate: {
          min: 1,
          max: 5
        }
      },
      comentario: {
        type: Sequelize.TEXT
      },
      fecha_calificacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      tipo_calificacion: {
        type: Sequelize.ENUM('producto', 'vendedor'),
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.INTEGER
      },
      vendedor_id: {
        type: Sequelize.INTEGER
      },
      producto_id: {
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Califications');
  }
};
