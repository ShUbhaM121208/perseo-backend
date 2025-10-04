// Use native fetch in Node.js 18+
// const fetch = require('node-fetch');

async function testSearch() {
  try {
    console.log('Testing Gmail search functionality...');
    
    const response = await fetch('http://localhost:3002/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        message: 'search emails about project update'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Search test result:');
    console.log(JSON.stringify(data, null, 2));

    // Test another search pattern
    console.log('\n--- Testing another search pattern ---');
    
    const response2 = await fetch('http://localhost:3002/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        message: 'find emails for meeting notes'
      })
    });

    const data2 = await response2.json();
    console.log('Second search test result:');
    console.log(JSON.stringify(data2, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSearch();