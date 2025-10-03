// Test other Gmail tools to find send functionality
import { Composio } from '@composio/core';
import dotenv from 'dotenv';

dotenv.config();

async function testSendFunctionality() {
  console.log('🔍 Testing Gmail send functionality...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const userId = 'shubhamm.0010@gmail.com';
    
    // First create a draft to get a draft ID
    console.log('1. Creating a draft...');
    const draftResult = await composio.tools.execute(
      'GMAIL_CREATE_EMAIL_DRAFT',
      {
        userId: userId,
        arguments: {
          recipient_email: 'test@example.com',
          subject: 'Test Send Draft',
          body: 'This is a test for sending draft'
        }
      }
    );
    
    const draftId = draftResult.data.response_data.id;
    console.log(`Draft created with ID: ${draftId}`);
    
    // Try to see if there are any send-related tools by checking all tools again
    console.log('\n2. Looking for send-related tools...');
    const tools = await composio.tools.get(userId, { toolkits: ['GMAIL'] });
    
    const sendTools = tools.filter(tool => {
      const name = tool.function?.name?.toLowerCase() || '';
      const desc = tool.function?.description?.toLowerCase() || '';
      return name.includes('send') || desc.includes('send') || name.includes('mail');
    });
    
    console.log(`Found ${sendTools.length} potential send tools:`);
    sendTools.forEach(tool => {
      console.log(`- ${tool.function.name}: ${tool.function.description.substring(0, 100)}...`);
    });
    
    // Check if we can modify the draft to send it by removing DRAFT label
    console.log('\n3. Testing label modification to send draft...');
    try {
      const sendByLabel = await composio.tools.execute(
        'GMAIL_ADD_LABEL_TO_EMAIL',
        {
          userId: userId,
          arguments: {
            message_id: draftResult.data.response_data.message.id,
            remove_label_ids: ['DRAFT']
          }
        }
      );
      console.log('✅ Successfully removed DRAFT label - this might send the email!');
      console.log('Result:', JSON.stringify(sendByLabel, null, 2));
    } catch (error) {
      console.log('❌ Failed to remove DRAFT label:', error.message);
    }
    
    // Try GMAIL_FORWARD_MESSAGE to see if it can send
    console.log('\n4. Testing forward as send method...');
    try {
      const forwardResult = await composio.tools.execute(
        'GMAIL_FORWARD_MESSAGE',
        {
          userId: userId,
          arguments: {
            message_id: draftResult.data.response_data.message.id,
            recipient_email: 'test@example.com',
            body: 'Forwarded email test'
          }
        }
      );
      console.log('✅ Forward worked - could be used for sending!');
      console.log('Result:', JSON.stringify(forwardResult, null, 2));
    } catch (error) {
      console.log('❌ Forward failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSendFunctionality();