const BASE_URL = 'http://localhost:3000';

async function testEndpoint(method, path, description) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { method });
    const status = response.status;
    let body = '';
    
    try {
      body = await response.text();
      if (body) {
        body = JSON.parse(body);
      }
    } catch (e) {
      // Not JSON
    }
    
    console.log(`\n${method} ${path} - ${description}`);
    console.log(`Status: ${status}`);
    if (status !== 200) {
      console.log('Response:', body);
    } else {
      console.log('✅ Success');
    }
  } catch (error) {
    console.log(`\n${method} ${path} - ${description}`);
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Testing API Endpoints\n');
  console.log('=' .repeat(50));
  
  // Test endpoints
  await testEndpoint('GET', '/api/test', 'Basic test endpoint');
  await testEndpoint('GET', '/api/test-neon', 'Direct Neon connection test');
  await testEndpoint('GET', '/api/test-db', 'Database test endpoint');
  await testEndpoint('GET', '/api/health', 'Health check');
  
  console.log('\n\n📋 Protected Endpoints (expect 401 without auth)');
  console.log('=' .repeat(50));
  
  await testEndpoint('GET', '/api/projects', 'List projects');
  await testEndpoint('GET', '/api/work-orders', 'List work orders');
  await testEndpoint('GET', '/api/tasks', 'List tasks');
  await testEndpoint('GET', '/api/quality-control', 'Quality control');
  await testEndpoint('GET', '/api/time-tracking', 'Time tracking');
  
  console.log('\n\n✅ Test complete!');
}

runTests().catch(console.error);