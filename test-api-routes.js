// Test script to verify all API routes are working correctly
const baseUrl = 'http://localhost:3006';

async function testAPIRoutes() {
  console.log('Testing API Routes...\n');

  // Test GET /api/projects
  console.log('1. Testing GET /api/projects');
  try {
    const response = await fetch(`${baseUrl}/api/projects`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log(`   ✅ Success - ${data.length} projects found`);
    } else {
      const text = await response.text();
      console.log(`   ❌ Error - Response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n2. Testing GET /api/tasks');
  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log(`   ✅ Success - ${data.length} tasks found`);
    } else {
      const text = await response.text();
      console.log(`   ❌ Error - Response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n3. Testing GET /api/work-orders');
  try {
    const response = await fetch(`${baseUrl}/api/work-orders`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log(`   ✅ Success - ${data.length} work orders found`);
    } else {
      const text = await response.text();
      console.log(`   ❌ Error - Response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\nDone!');
}

// Run the tests
testAPIRoutes();