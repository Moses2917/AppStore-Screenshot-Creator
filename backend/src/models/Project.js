import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection.js';

class Project extends Model {}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted'),
      defaultValue: 'active'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        defaultDevice: 'iphone',
        defaultBackground: '#f5f5f7',
        defaultTextColor: '#000000',
        defaultFontSize: 32,
        defaultFontFamily: 'Arial, sans-serif'
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional metadata like tags, categories, etc.'
    },
    screenshotCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastEditedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['isPublic']
      },
      {
        fields: ['createdAt']
      }
    ]
  }
);

export default Project;
