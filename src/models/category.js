module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    categoria_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'categoria_id'
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'nombre'  
    },
    descripcion: {
      type: DataTypes.TEXT,
      field: 'description'
    },
    imagen: {
      type: DataTypes.STRING,
      field: 'image'
    }
  }, {
    tableName: 'categories',  
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true  
  });

  return Category;
};