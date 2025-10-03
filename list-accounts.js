// List connected accounts to find the correct entity ID
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function listConnectedAccounts() {
  console.log('📋 Listing Connected Accounts...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const connections = await composio.connectedAccounts.list();
    console.log(`Found ${connections.items.length} connected accounts:\n`);
    
    connections.items.forEach((conn, index) => {
      console.log(`${index + 1}. Connection ID: ${conn.id}`);
      console.log(`   Status: ${conn.status}`);
      console.log(`   App: ${conn.app}`);
      console.log(`   Entity ID: ${conn.entityId}`);
      if (conn.data) {
        console.log(`   Data keys: ${Object.keys(conn.data).join(', ')}`);
      }
      console.log('   ---');
    });
    
    // Find Gmail connections specifically
    const gmailConnections = connections.items.filter(conn => 
      conn.app?.toLowerCase().includes('gmail') || 
      conn.entityId?.includes('@')
    );
    
    if (gmailConnections.length > 0) {
      console.log('\n📧 Gmail Connections Found:');
      gmailConnections.forEach((conn, index) => {
        console.log(`${index + 1}. ID: ${conn.id}`);
        console.log(`   Entity ID: ${conn.entityId}`);
        console.log(`   Status: ${conn.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to list accounts:', error.message);
  }
}

listConnectedAccounts();