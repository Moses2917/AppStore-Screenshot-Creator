import User from './User.js';
import Project from './Project.js';
import Screenshot from './Screenshot.js';
import Template from './Template.js';
import ExportJob from './ExportJob.js';

// Define associations

// User associations
User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
User.hasMany(Screenshot, { foreignKey: 'userId', as: 'screenshots' });
User.hasMany(Template, { foreignKey: 'userId', as: 'templates' });
User.hasMany(ExportJob, { foreignKey: 'userId', as: 'exportJobs' });

// Project associations
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Project.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });
Project.hasMany(Screenshot, { foreignKey: 'projectId', as: 'screenshots' });
Project.hasMany(ExportJob, { foreignKey: 'projectId', as: 'exportJobs' });

// Screenshot associations
Screenshot.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Screenshot.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Template associations
Template.belongsTo(User, { foreignKey: 'userId', as: 'creator' });
Template.hasMany(Project, { foreignKey: 'templateId', as: 'projects' });

// ExportJob associations
ExportJob.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ExportJob.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

export {
  User,
  Project,
  Screenshot,
  Template,
  ExportJob
};
