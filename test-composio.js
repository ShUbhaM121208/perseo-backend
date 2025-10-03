// Simple Composio connection test
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function testComposioConnection() {
  console.log('🧪 Testing Composio Connection...');
  
  try {
    console.log('API Key:', process.env.COMPOSIO_API_KEY ? 'Present' : 'Missing');
    
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    console.log('✅ Composio client created successfully');
    
    // Test basic API call
    console.log('📡 Testing API connectivity...');
    const connections = await composio.connectedAccounts.list();
    console.log('✅ API call successful');
    console.log('Connected accounts:', connections.items.length);
    
    // Test Gmail tools
    console.log('🔧 Testing Gmail tools access...');
    const tools = await composio.tools.get('test-user', { toolkits: ['GMAIL'] });
    console.log('✅ Gmail tools accessible');
    console.log('Available Gmail tools:', tools.length);
    
  } catch (error) {
    console.error('❌ Composio connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.cause) {
      console.error('Root cause:', error.cause);
    }
  }
}

testComposioConnection();