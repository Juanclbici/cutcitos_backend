module.exports = (sequelize, DataTypes) => {
    const RealTimeSale = sequelize.define('RealTimeSale', {
      venta_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ubicacion_actual: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fecha_venta: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
  
    RealTimeSale.associate = function(models) {
      RealTimeSale.belongsTo(models.User, { 
        as: 'Vendedor',
        foreignKey: 'vendedor_id' 
      });
    };
  
    return RealTimeSale;
  };