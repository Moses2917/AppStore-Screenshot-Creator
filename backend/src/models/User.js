import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection.js';
import bcrypt from 'bcryptjs';

class User extends Model {
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'premium'),
      defaultValue: 'user'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    storageUsed: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: 'Storage used in bytes'
    },
    storageLimit: {
      type: DataTypes.BIGINT,
      defaultValue: 5368709120, // 5GB default
      comment: 'Storage limit in bytes'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        theme: 'dark',
        notifications: true,
        defaultExportFormat: 'png',
        defaultExportQuality: 90
      }
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;
