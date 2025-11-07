import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection.js';

class ExportJob extends Model {}

ExportJob.init(
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
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    screenshotIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      comment: 'Array of screenshot IDs to export'
    },
    exportType: {
      type: DataTypes.ENUM('single', 'batch', 'project'),
      defaultValue: 'single'
    },
    exportPreset: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Preset name like "iPhone 6.7", "Instagram Story", etc.'
    },
    exportSettings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        format: 'png',
        quality: 90,
        width: 1290,
        height: 2796,
        scale: 2
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Progress percentage'
    },
    resultUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'URLs of exported files'
    },
    zipUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL of ZIP file for batch exports'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Processing time in milliseconds'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the exported files will be deleted'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional processing metadata'
    }
  },
  {
    sequelize,
    modelName: 'ExportJob',
    tableName: 'export_jobs',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['projectId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['expiresAt']
      }
    ]
  }
);

export default ExportJob;
