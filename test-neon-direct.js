const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('Testing direct Neon connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test the connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✓ Database connected successfully');
    console.log('Current time from database:', result[0].current_time);
    
    // Check tables
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public';
    `;
    console.log(`✓ Found ${tables.length} tables in the database`);
    
    console.log('\nDatabase test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testConnection();