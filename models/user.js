const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('Usuario', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_email', // Nombre fijo para la restricción única
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('usuario', 'vendedor', 'admin'),
    defaultValue: 'usuario'
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  foto_perfil: {
    type: DataTypes.STRING,
    defaultValue: 'default.jpg'
  },
  telefono: {
    type: DataTypes.STRING
  },
  estado_cuenta: {
    type: DataTypes.ENUM('activo', 'bloqueado'),
    defaultValue: 'activo'
  },
  codigo_UDG: {
    type: DataTypes.STRING,
    unique: 'unique_codigo_udg' // Nombre fijo para la restricción única
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // Configuración de índices explícita
  indexes: [
    {
      name: 'unique_email',
      unique: true,
      fields: ['email']
    },
    {
      name: 'unique_codigo_udg',
      unique: true,
      fields: ['codigo_UDG']
    }
  ],
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

module.exports = User;