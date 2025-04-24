const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'unique_email',
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100]
      }
    },
    rol: {
      type: DataTypes.ENUM('admin', 'seller', 'buyer'),
      defaultValue: 'buyer',
      validate: {
        isIn: [['admin', 'seller', 'buyer']]
      }
    },
    foto_perfil: {
      type: DataTypes.STRING,
      defaultValue: 'default_profile.jpg',
    },
    telefono: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9]{10,15}$/
      }
    },
    estado_cuenta: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    codigo_UDG: {
      type: DataTypes.STRING,
      unique: 'unique_codigo_udg',
      field: 'codigo_udg',
      validate: {
        is: {
          args: /^[0-9]{8,10}$/,
          msg: 'El código UDG debe contener entre 8 y 10 dígitos numéricos'
        }
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reset_password_token' 
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reset_password_expires'
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: 'unique_email',
        unique: true,
        fields: ['email']
      },
      {
        name: 'unique_codigo_udg',
        unique: true,
        fields: ['codigo_udg']
      }
    ],
    defaultScope: {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Método para comparar contraseñas
  User.prototype.comparePassword = async function(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  };

  User.associate = function(models) {
    User.hasMany(models.Product, { foreignKey: 'vendedor_id' });
    User.hasMany(models.Order, { foreignKey: 'usuario_id' });
    User.hasMany(models.Favorite, { foreignKey: 'usuario_id' });
    User.hasMany(models.Message, { 
      as: 'SentMessages',
      foreignKey: 'usuario_id' 
    });
    User.hasMany(models.Message, { 
      as: 'ReceivedMessages',
      foreignKey: 'vendedor_id' 
    });
    User.hasMany(models.Notification, { foreignKey: 'usuario_id' });
    User.hasMany(models.Calification, { 
      as: 'GivenCalifications',
      foreignKey: 'usuario_id' 
    });
    User.hasMany(models.Calification, { 
      as: 'ReceivedCalifications',
      foreignKey: 'vendedor_id' 
    });
    User.hasMany(models.RealTimeSale, { foreignKey: 'vendedor_id' });
  };

  return User;
};