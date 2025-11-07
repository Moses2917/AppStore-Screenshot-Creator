import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection.js';

class Template extends Model {}

Template.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: 'Null for system templates'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g., minimal, colorful, professional, playful'
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'True for built-in templates'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    previewUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Multiple preview images'
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Template configuration matching screenshot config structure'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Searchable tags for template'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 5
      }
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional metadata like author info, version, etc.'
    }
  },
  {
    sequelize,
    modelName: 'Template',
    tableName: 'templates',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['category']
      },
      {
        fields: ['isSystem']
      },
      {
        fields: ['isPublic']
      },
      {
        fields: ['isPremium']
      },
      {
        fields: ['usageCount']
      },
      {
        fields: ['rating']
      }
    ]
  }
);

export default Template;
