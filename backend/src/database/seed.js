import { sequelize } from './connection.js';
import { User, Project, Template } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed the database with initial data
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@screenshot-creator.com',
      password: 'admin123',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      storageLimit: -1 // Unlimited
    });
    console.log('✅ Admin user created');

    // Create test user
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'test123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isEmailVerified: true
    });
    console.log('✅ Test user created');

    // Create system templates
    const templates = [
      {
        name: 'Minimal Light',
        description: 'Clean and minimal design with light background',
        category: 'minimal',
        isSystem: true,
        isPublic: true,
        isPremium: false,
        tags: ['minimal', 'light', 'clean'],
        config: {
          backgroundColor: '#f5f5f7',
          backgroundType: 'solid',
          deviceFrame: 'iphone',
          textColor: '#000000',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Minimal Dark',
        description: 'Clean and minimal design with dark background',
        category: 'minimal',
        isSystem: true,
        isPublic: true,
        isPremium: false,
        tags: ['minimal', 'dark', 'clean'],
        config: {
          backgroundColor: '#1a1a1a',
          backgroundType: 'solid',
          deviceFrame: 'iphone',
          textColor: '#ffffff',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Purple Dream',
        description: 'Vibrant purple gradient background',
        category: 'colorful',
        isSystem: true,
        isPublic: true,
        isPremium: false,
        tags: ['gradient', 'purple', 'vibrant'],
        config: {
          backgroundColor: '#667eea',
          backgroundType: 'gradient',
          gradientColors: ['#667eea', '#764ba2'],
          gradientAngle: 135,
          deviceFrame: 'iphone',
          textColor: '#ffffff',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textShadow: true
        }
      },
      {
        name: 'Ocean Blue',
        description: 'Calming blue ocean gradient',
        category: 'colorful',
        isSystem: true,
        isPublic: true,
        isPremium: false,
        tags: ['gradient', 'blue', 'ocean'],
        config: {
          backgroundColor: '#4facfe',
          backgroundType: 'gradient',
          gradientColors: ['#4facfe', '#00f2fe'],
          gradientAngle: 90,
          deviceFrame: 'iphone',
          textColor: '#ffffff',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textShadow: true
        }
      },
      {
        name: 'Sunset',
        description: 'Warm sunset gradient',
        category: 'colorful',
        isSystem: true,
        isPublic: true,
        isPremium: false,
        tags: ['gradient', 'warm', 'sunset'],
        config: {
          backgroundColor: '#ff6b6b',
          backgroundType: 'gradient',
          gradientColors: ['#ff6b6b', '#ffd93d'],
          gradientAngle: 135,
          deviceFrame: 'iphone',
          textColor: '#ffffff',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textShadow: true
        }
      },
      {
        name: 'Forest Green',
        description: 'Natural forest green gradient',
        category: 'nature',
        isSystem: true,
        isPublic: true,
        isPremium: true,
        tags: ['gradient', 'green', 'nature'],
        config: {
          backgroundColor: '#11998e',
          backgroundType: 'gradient',
          gradientColors: ['#11998e', '#38ef7d'],
          gradientAngle: 90,
          deviceFrame: 'iphone',
          textColor: '#ffffff',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textShadow: true
        }
      },
      {
        name: 'Peach',
        description: 'Soft peach gradient',
        category: 'soft',
        isSystem: true,
        isPublic: true,
        isPremium: true,
        tags: ['gradient', 'peach', 'soft'],
        config: {
          backgroundColor: '#ffecd2',
          backgroundType: 'gradient',
          gradientColors: ['#ffecd2', '#fcb69f'],
          gradientAngle: 135,
          deviceFrame: 'iphone',
          textColor: '#333333',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Neon',
        description: 'Bold neon gradient',
        category: 'bold',
        isSystem: true,
        isPublic: true,
        isPremium: true,
        tags: ['gradient', 'neon', 'bold'],
        config: {
          backgroundColor: '#f093fb',
          backgroundType: 'gradient',
          gradientColors: ['#f093fb', '#f5576c'],
          gradientAngle: 90,
          deviceFrame: 'iphone',
          textColor: '#ffffff',
          fontSize: 48,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textShadow: true
        }
      }
    ];

    for (const templateData of templates) {
      await Template.create(templateData);
    }
    console.log(`✅ Created ${templates.length} system templates`);

    // Create sample project for test user
    const sampleProject = await Project.create({
      userId: testUser.id,
      name: 'Sample Project',
      description: 'A sample project to get you started',
      templateId: (await Template.findOne({ where: { name: 'Purple Dream' } })).id,
      status: 'active'
    });
    console.log('✅ Created sample project');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@screenshot-creator.com / admin123');
    console.log('   User:  test@example.com / test123');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seed;
