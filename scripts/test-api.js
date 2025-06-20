const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const endpoints = [
  { method: 'GET', path: '/api/test-db', name: 'Database Connection' },
  { method: 'GET', path: '/api/work-orders', name: 'List Work Orders' },
  { method: 'GET', path: '/api/time-tracking', name: 'List Time Logs' },
  { method: 'GET', path: '/api/quality-control', name: 'List Quality Checks' },
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\nTesting ${endpoint.name}...`);
    const response = await fetch(`${baseUrl}${endpoint.path}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const status = response.status;
    const statusText = response.statusText;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint.name}: ${status} ${statusText}`);
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      const error = await response.text();
      console.log(`❌ ${endpoint.name}: ${status} ${statusText}`);
      console.log(`   Error: ${error.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: Failed to connect`);
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('Starting API endpoint tests...');
  console.log(`Base URL: ${baseUrl}`);
  console.log('================================');

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }

  console.log('\n================================');
  console.log('API tests completed!');
}

runTests();