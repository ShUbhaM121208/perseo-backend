// Debug script to check Composio tool structure
import { Composio } from '@composio/core';
import dotenv from 'dotenv';

dotenv.config();

async function debugComposioTools() {
  console.log('🔍 Debugging Composio Gmail tools structure...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const userId = 'shubhamm.0010@gmail.com';
    
    // Get Gmail tools
    console.log('Getting Gmail tools...');
    const tools = await composio.tools.get(userId, { toolkits: ['GMAIL'] });
    
    console.log(`Found ${tools.length} tools`);
    
    if (tools.length > 0) {
      console.log('\n📋 Complete list of Gmail tools:');
      tools.forEach((tool, index) => {
        const toolName = tool.function?.name || 'Unknown';
        const description = tool.function?.description || 'No description';
        console.log(`${index + 1}. ${toolName}`);
        console.log(`   Description: ${description.substring(0, 100)}...`);
        console.log('   ---');
      });
      
      console.log('\n📋 Tool names for backend routes:');
      const toolNames = tools.map(tool => tool.function?.name).filter(Boolean);
      toolNames.forEach(name => console.log(`✅ ${name}`));
    }
    
    // Try to execute the correct tool name
    console.log('\n🧪 Testing GMAIL_CREATE_EMAIL_DRAFT...');
    try {
      const result = await composio.tools.execute(
        'GMAIL_CREATE_EMAIL_DRAFT',
        {
          userId: userId,
          arguments: {
            recipient_email: 'test@example.com',
            subject: 'Test',
            body: 'Test body'
          }
        }
      );
      console.log('✅ GMAIL_CREATE_EMAIL_DRAFT execution successful!');
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('❌ GMAIL_CREATE_EMAIL_DRAFT execution failed:', error.message);
    }
    
    // Try alternative tool names
    const alternativeNames = [
      'gmail_create_draft',
      'GMAIL_DRAFT',
      'CREATE_DRAFT',
      'gmail_compose_email',
      'GMAIL_COMPOSE_EMAIL'
    ];
    
    for (const toolName of alternativeNames) {
      try {
        console.log(`🧪 Testing ${toolName}...`);
        const result = await composio.tools.execute(
          toolName,
          {
            userId: userId,
            arguments: {
              to: 'test@example.com',
              subject: 'Test',
              body: 'Test body'
            }
          }
        );
        console.log(`✅ ${toolName} execution successful!`);
        break;
      } catch (error) {
        console.log(`❌ ${toolName} failed: ${error.message.substring(0, 100)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugComposioTools();