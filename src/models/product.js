module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    producto_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'producto_id'  
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del producto es requerido'
        },
        len: {
          args: [3, 100],
          msg: 'El nombre debe tener entre 3 y 100 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'La descripción no puede exceder los 1000 caracteres'
        }
      }
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El precio debe ser un número decimal válido'
        },
        min: {
          args: [0.01],
          msg: 'El precio debe ser mayor a 0'
        }
      }
    },
    cantidad_disponible: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'La cantidad disponible debe ser un número entero'
        },
        min: {
          args: [0],
          msg: 'La cantidad disponible no puede ser negativa'
        }
      }
    },
    cantidad_vendida: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'La cantidad vendida debe ser un número entero'
        },
        min: {
          args: [0],
          msg: 'La cantidad vendida no puede ser negativa'
        }
      }
    },
    imagen: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
          msg: 'La imagen debe ser una URL válida',
          protocols: ['http','https'],
          require_protocol: true
        }
      }
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          msg: 'La fecha de publicación debe ser una fecha válida'
        }
      }
    },
    estado_producto: {
      type: DataTypes.ENUM('disponible', 'agotado', 'inactivo'),
      defaultValue: 'disponible',
      validate: {
        isIn: {
          args: [['disponible', 'agotado', 'inactivo']],
          msg: 'Estado del producto no válido'
        }
      }
    }
  }, {
    tableName: 'products', 
    timestamps: true, 
    paranoid: true, 
    underscored: true, 
    indexes: [
      {
        fields: ['nombre'] 
      },
      {
        fields: ['precio']
      },
      {
        fields: ['categoria_id'] 
      },
      {
        fields: ['vendedor_id'] 
      }
    ],
    hooks: {
      beforeValidate: (product) => {
        
        if (product.nombre) {
          product.nombre = product.nombre.charAt(0).toUpperCase() + 
                          product.nombre.slice(1).toLowerCase();
        }
      },
      afterUpdate: (product) => {
        // Actualizar estado si cantidad_disponible cambia
        if (product.changed('cantidad_disponible')) {
          let newEstado = 'disponible';
          if (product.cantidad_disponible <= 0) {
            newEstado = 'agotado';
          }
          product.update({ estado_producto: newEstado });
        }
      }
    }
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Category, { 
      foreignKey: 'categoria_id',
      targetKey: 'categoria_id', 
      as: 'Categoria'
    });
    
    Product.belongsTo(models.User, { 
      as: 'Vendedor',
      foreignKey: 'vendedor_id',
      onDelete: 'CASCADE'
    });
    
    Product.hasMany(models.Order, { 
      foreignKey: 'producto_id',
      as: 'Ordenes'
    });
    
    Product.hasMany(models.Favorite, { 
      foreignKey: 'producto_id',
      as: 'Favoritos'
    });
    
    Product.hasMany(models.Calification, { 
      foreignKey: 'producto_id',
      as: 'Calificaciones'
    });

    Product.belongsToMany(models.Order, {
      through: models.OrderItem,
      foreignKey: 'producto_id',
      otherKey: 'order_id',
      as: 'OrdenesPorProducto'
    });
    
  };

  // Métodos de instancia
  Product.prototype.marcarComoAgotado = function() {
    return this.update({ 
      estado_producto: 'agotado',
      cantidad_disponible: 0
    });
  };

  Product.prototype.incrementarVentas = async function(cantidad) {
    const nuevaCantidad = this.cantidad_vendida + cantidad;
    return this.update({ 
      cantidad_vendida: nuevaCantidad,
      cantidad_disponible: Math.max(0, this.cantidad_disponible - cantidad)
    });
  };

  return Product;
};