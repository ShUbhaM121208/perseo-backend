import { Composio } from '@composio/core';
import dotenv from 'dotenv';

dotenv.config();

async function checkGmailConnections() {
  console.log('🔍 Checking all Gmail connections...');
  
  const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY
  });

  try {
    // Get all connected accounts
    const connections = await composio.connectedAccounts.list();
    
    console.log('📋 All connections:');
    connections.items.forEach((conn, index) => {
      console.log(`${index + 1}. App: ${conn.appName || 'Unknown'} - Status: ${conn.status} - ID: ${conn.id}`);
      console.log('   Full connection:', JSON.stringify(conn, null, 2));
    });

    // Since appName is undefined, let's use any active connection
    const activeConnections = connections.items.filter(conn => 
      conn.status === 'ACTIVE'
    );

    if (activeConnections.length === 0) {
      console.log('❌ No active connections found');
      return;
    }

    console.log(`✅ Found ${activeConnections.length} active connections`);

    // Use the first active connection for testing
    const testConnection = activeConnections[0];
    console.log(`\n🧪 Testing with connection: ${testConnection.id}`);

    // Get detailed tool information for GMAIL_CREATE_EMAIL_DRAFT
    console.log('\n📋 Getting detailed tool information...');
    
    const tools = await composio.tools.list({ appNames: ['gmail'] });
    const draftTool = tools.items.find(tool => 
      tool.name === 'GMAIL_CREATE_EMAIL_DRAFT' || 
      tool.function?.name === 'GMAIL_CREATE_EMAIL_DRAFT'
    );
    
    if (draftTool) {
      console.log('✅ Found GMAIL_CREATE_EMAIL_DRAFT tool details:');
      console.log('Name:', draftTool.name || draftTool.function?.name);
      console.log('Description:', draftTool.description || draftTool.function?.description);
      
      if (draftTool.parameters || draftTool.function?.parameters) {
        console.log('Parameters:');
        console.log(JSON.stringify(draftTool.parameters || draftTool.function?.parameters, null, 2));
      }
    } else {
      console.log('❌ GMAIL_CREATE_EMAIL_DRAFT tool not found');
    }

    // Search for any send-related tools
    console.log('\n🔍 Searching for send-related tools...');
    const sendTools = tools.items.filter(tool => {
      const name = tool.name || tool.function?.name || '';
      const desc = tool.description || tool.function?.description || '';
      return name.toLowerCase().includes('send') || desc.toLowerCase().includes('send');
    });
    
    if (sendTools.length > 0) {
      console.log('📋 Send-related tools:');
      sendTools.forEach(tool => {
        const name = tool.name || tool.function?.name;
        const desc = tool.description || tool.function?.description;
        console.log(`- ${name}: ${desc}`);
      });
    } else {
      console.log('❌ No send-related tools found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkGmailConnections();