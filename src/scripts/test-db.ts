import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test raw query
    const result = await prisma.$queryRaw`SELECT NOW() as time, current_database() as db`;
    console.log('✅ Database connected:', result);
    
    // Count tables
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    console.log('📊 Tables in database:', tableCount);
    
    // Test creating data
    const testOrg = await prisma.organization.create({
      data: {
        name: 'IMASD Test',
        slug: `imasd-test-${Date.now()}`,
        description: 'Test organization for Blueprint Pro'
      }
    });
    console.log('✅ Created organization:', testOrg.name);
    
    // Clean up
    await prisma.organization.delete({
      where: { id: testOrg.id }
    });
    console.log('🧹 Cleaned up test data');
    
    console.log('\n✨ All tests passed! Database is working correctly.');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();