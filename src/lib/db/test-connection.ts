import prisma from './prisma';

export async function testDatabaseConnection() {
  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log('✅ Database connection successful:', result);
    
    // Test creating an organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org-' + Date.now(),
        description: 'Test organization for validation'
      }
    });
    console.log('✅ Created test organization:', org.id);
    
    // Clean up
    await prisma.organization.delete({
      where: { id: org.id }
    });
    console.log('✅ Cleaned up test data');
    
    return { success: true, message: 'All database tests passed!' };
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}