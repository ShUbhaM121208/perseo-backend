import { Composio } from '@composio/core';
import dotenv from 'dotenv';

dotenv.config();

async function testGmailSendOptions() {
  console.log('🔍 Testing Gmail send options with GMAIL_CREATE_EMAIL_DRAFT...');
  
  const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY
  });

  try {
    // Get the first connected account
    const connections = await composio.connectedAccounts.list();
    const activeConnection = connections.items.find(conn => 
      conn.status === 'ACTIVE' && conn.appName === 'gmail'
    );

    if (!activeConnection) {
      console.log('❌ No active Gmail connection found');
      return;
    }

    console.log('✅ Found active Gmail connection:', activeConnection.id);

    // Test 1: Try GMAIL_CREATE_EMAIL_DRAFT with send-like parameters
    console.log('\n🧪 Test 1: GMAIL_CREATE_EMAIL_DRAFT with potential send parameters...');
    
    const testParams = {
      recipient_email: 'test@example.com',
      subject: 'Test - Can this send immediately?',
      body: 'Testing if GMAIL_CREATE_EMAIL_DRAFT can send immediately',
      send: true,  // Try sending parameter
      is_draft: false,  // Try non-draft parameter
      action: 'send'  // Try action parameter
    };

    try {
      const result = await composio.tools.execute('GMAIL_CREATE_EMAIL_DRAFT', testParams, activeConnection.id);
      console.log('✅ GMAIL_CREATE_EMAIL_DRAFT result:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check if it was sent or just drafted
      const message = result.data?.response_data?.message;
      if (message?.labelIds) {
        console.log('📋 Message labels:', message.labelIds);
        if (message.labelIds.includes('SENT')) {
          console.log('🎉 SUCCESS: Email was sent immediately!');
        } else if (message.labelIds.includes('DRAFT')) {
          console.log('📝 INFO: Email was saved as draft only');
        }
      }
      
    } catch (error) {
      console.log('❌ GMAIL_CREATE_EMAIL_DRAFT with send params failed:', error.message);
    }

    // Test 2: Try to get tool details to see available parameters
    console.log('\n🧪 Test 2: Getting GMAIL_CREATE_EMAIL_DRAFT tool details...');
    
    try {
      const tools = await composio.tools.list({ appNames: ['gmail'] });
      const draftTool = tools.items.find(tool => tool.name === 'GMAIL_CREATE_EMAIL_DRAFT');
      
      if (draftTool) {
        console.log('📋 GMAIL_CREATE_EMAIL_DRAFT parameters:');
        console.log(JSON.stringify(draftTool.parameters, null, 2));
      }
    } catch (error) {
      console.log('❌ Failed to get tool details:', error.message);
    }

    // Test 3: Check for any send-related tools we might have missed
    console.log('\n🧪 Test 3: Searching for any send-related tools...');
    
    try {
      const allTools = await composio.tools.list({ appNames: ['gmail'] });
      const sendTools = allTools.items.filter(tool => 
        tool.name.toLowerCase().includes('send') || 
        tool.description.toLowerCase().includes('send')
      );
      
      console.log('📋 Send-related tools found:');
      sendTools.forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description}`);
      });
      
      if (sendTools.length === 0) {
        console.log('❌ No send-related tools found');
      }
      
    } catch (error) {
      console.log('❌ Failed to search tools:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGmailSendOptions();