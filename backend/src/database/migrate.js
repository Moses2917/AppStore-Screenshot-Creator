import { sequelize } from './connection.js';
import '../models/index.js'; // Import models to register them
import dotenv from 'dotenv';

dotenv.config();

/**
 * Run database migrations
 */
async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models
    // In production, use proper migration tools like Sequelize migrations
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Production mode: use proper migrations');
      console.log('   Run: npx sequelize-cli db:migrate');
      return;
    }

    // Development: sync with alter
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default migrate;
