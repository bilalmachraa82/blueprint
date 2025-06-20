import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test the connection
    await prisma.$connect();
    console.log('✓ Database connected successfully');
    
    // Count tables
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public';
    `;
    console.log(`✓ Found ${tables.length} tables in the database`);
    
    // Test a simple query
    const orgCount = await prisma.organization.count();
    console.log(`✓ Organizations count: ${orgCount}`);
    
    console.log('\nDatabase test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();