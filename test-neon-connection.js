const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testNeonConnection() {
  console.log('Testing Neon connection...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL is set');
  console.log(`   URL pattern: ${process.env.DATABASE_URL.replace(/:[^@]+@/, ':****@').substring(0, 50)}...`);
  
  try {
    // Create Neon client
    const sql = neon(process.env.DATABASE_URL);
    
    // Test 1: Simple query
    console.log('\n📊 Test 1: Simple connection test');
    const result = await sql`SELECT version()`;
    console.log('✅ Connected to PostgreSQL');
    console.log(`   Version: ${result[0].version}`);
    
    // Test 2: Check current database
    console.log('\n📊 Test 2: Current database info');
    const dbInfo = await sql`SELECT current_database(), current_user`;
    console.log('✅ Database info retrieved');
    console.log(`   Database: ${dbInfo[0].current_database}`);
    console.log(`   User: ${dbInfo[0].current_user}`);
    
    // Test 3: List tables
    console.log('\n📊 Test 3: List tables');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`   - ${t.tablename}`));
    
    // Test 4: Check if Prisma migrations table exists
    console.log('\n📊 Test 4: Check Prisma migrations');
    const migrations = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename = '_prisma_migrations'
    `;
    if (migrations.length > 0) {
      console.log('✅ Prisma migrations table exists');
      const migrationCount = await sql`SELECT COUNT(*) as count FROM _prisma_migrations`;
      console.log(`   Applied migrations: ${migrationCount[0].count}`);
    } else {
      console.log('⚠️  Prisma migrations table not found - database may not be initialized');
    }
    
    // Test 5: Try to query a table
    console.log('\n📊 Test 5: Query Organization table');
    try {
      const orgs = await sql`SELECT COUNT(*) as count FROM "Organization"`;
      console.log(`✅ Organization table accessible`);
      console.log(`   Records: ${orgs[0].count}`);
    } catch (e) {
      console.log(`⚠️  Organization table not accessible: ${e.message}`);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  }
}

testNeonConnection();