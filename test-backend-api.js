// Test the corrected Gmail routes through the actual backend API
import { execSync } from 'child_process';

async function testBackendGmailRoutes() {
  console.log('🧪 Testing corrected Gmail routes through backend API...\n');
  
  try {
    // First, let's get a JWT token for authentication (mock for testing)
    const testToken = 'mock_jwt_token'; // For testing, we'll use a mock token
    
    // Test 1: Create Draft
    console.log('✅ Testing POST /api/gmail/create-draft...');
    try {
      const draftResponse = await fetch('http://localhost:3002/api/gmail/create-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          connectedAccountId: 'test-account-id',
          to: 'test@example.com',
          subject: 'Test Draft via Backend API',
          body: 'This is a test draft created through the corrected backend API.',
        }),
      });
      
      const draftResult = await draftResponse.json();
      console.log(`Status: ${draftResponse.status}`);
      console.log('Response:', JSON.stringify(draftResult, null, 2));
      
      if (draftResponse.ok) {
        console.log('✅ Draft creation route works!');
      } else {
        console.log('❌ Draft creation failed');
      }
    } catch (error) {
      console.log(`❌ Draft creation error: ${error.message}`);
    }
    
    // Test 2: Send Draft (will fail because we don't have a real draft ID)
    console.log('\n✅ Testing POST /api/gmail/send-draft...');
    try {
      const sendResponse = await fetch('http://localhost:3002/api/gmail/send-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          connectedAccountId: 'test-account-id',
          draft_id: 'test-draft-id',
        }),
      });
      
      const sendResult = await sendResponse.json();
      console.log(`Status: ${sendResponse.status}`);
      console.log('Response:', JSON.stringify(sendResult, null, 2));
    } catch (error) {
      console.log(`❌ Send draft error: ${error.message}`);
    }
    
    // Test 3: Reply to Email
    console.log('\n✅ Testing POST /api/gmail/reply...');
    try {
      const replyResponse = await fetch('http://localhost:3002/api/gmail/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          connectedAccountId: 'test-account-id',
          thread_id: 'test-thread-id',
          body: 'This is a test reply.',
        }),
      });
      
      const replyResult = await replyResponse.json();
      console.log(`Status: ${replyResponse.status}`);
      console.log('Response:', JSON.stringify(replyResult, null, 2));
    } catch (error) {
      console.log(`❌ Reply error: ${error.message}`);
    }
    
    // Test 4: Modify Labels
    console.log('\n✅ Testing POST /api/gmail/labels...');
    try {
      const labelsResponse = await fetch('http://localhost:3002/api/gmail/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          connectedAccountId: 'test-account-id',
          message_id: 'test-message-id',
          add_labels: ['IMPORTANT'],
        }),
      });
      
      const labelsResult = await labelsResponse.json();
      console.log(`Status: ${labelsResponse.status}`);
      console.log('Response:', JSON.stringify(labelsResult, null, 2));
    } catch (error) {
      console.log(`❌ Labels error: ${error.message}`);
    }
    
    // Test 5: Move Message
    console.log('\n✅ Testing POST /api/gmail/move...');
    try {
      const moveResponse = await fetch('http://localhost:3002/api/gmail/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          connectedAccountId: 'test-account-id',
          message_id: 'test-message-id',
          destination: 'trash',
        }),
      });
      
      const moveResult = await moveResponse.json();
      console.log(`Status: ${moveResponse.status}`);
      console.log('Response:', JSON.stringify(moveResult, null, 2));
    } catch (error) {
      console.log(`❌ Move error: ${error.message}`);
    }
    
    // Test 6: Get Message
    console.log('\n✅ Testing GET /api/gmail/message/test-id...');
    try {
      const getMessage = await fetch('http://localhost:3002/api/gmail/message/test-message-id?connectedAccountId=test-account-id', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testToken}`,
        },
      });
      
      const messageResult = await getMessage.json();
      console.log(`Status: ${getMessage.status}`);
      console.log('Response:', JSON.stringify(messageResult, null, 2));
    } catch (error) {
      console.log(`❌ Get message error: ${error.message}`);
    }
    
    console.log('\n🎯 Backend API Testing Complete!');
    console.log('Note: Some failures are expected due to test data, but we can see if the routes are working.');
    
  } catch (error) {
    console.error('❌ Backend testing failed:', error);
  }
}

testBackendGmailRoutes();