import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database/connection.js';

class Screenshot extends Model {}

Screenshot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
      allowNull: true
    },
    originalImageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'S3 URL or cloud storage URL'
    },
    processedImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL of processed/rendered screenshot'
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageMetadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Original image dimensions, format, size, etc.'
    },
    config: {
      type: DataTypes.JSONB,
      defaultValue: {
        backgroundColor: '#f5f5f7',
        backgroundType: 'solid',
        gradientColors: ['#667eea', '#764ba2'],
        gradientAngle: 135,
        deviceFrame: 'iphone',
        devicePosition: { x: 50, y: 50 },
        textTop: '',
        textBottom: '',
        textColor: '#000000',
        fontSize: 32,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        textShadow: false,
        textTopPosition: { x: 50, y: 15 },
        textBottomPosition: { x: 50, y: 85 },
        rotation: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        decorativeImages: []
      },
      comment: 'All editor configuration for this screenshot'
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Order within the project'
    },
    fileSize: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: 'File size in bytes'
    },
    status: {
      type: DataTypes.ENUM('uploading', 'processing', 'ready', 'failed'),
      defaultValue: 'uploading'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Screenshot',
    tableName: 'screenshots',
    indexes: [
      {
        fields: ['projectId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['order']
      }
    ]
  }
);

export default Screenshot;
