module.exports = (sequelize, DataTypes) => {
    const Categoria = sequelize.define('Categoria', {
      nombre: DataTypes.STRING,
      descripcion: DataTypes.TEXT
    }, {});
  
    Categoria.associate = function(models) {
      Categoria.hasMany(models.Producto, { foreignKey: 'categoria_id' });
    };
  
    return Categoria;
  };