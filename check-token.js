// Check id_token contents to find the email
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function checkTokenContents() {
  console.log('🔍 Checking ID Token Contents...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const connections = await composio.connectedAccounts.list();
    
    // Find an active connection with id_token
    const activeConnection = connections.items.find(conn => 
      conn.status === 'ACTIVE' && conn.data?.id_token
    );
    
    if (!activeConnection) {
      console.log('❌ No active connection with id_token found');
      return;
    }
    
    console.log(`Using connection: ${activeConnection.id}`);
    
    const idToken = activeConnection.data.id_token;
    console.log('ID Token (first 50 chars):', idToken.substring(0, 50) + '...');
    
    // Decode JWT token
    const tokenParts = idToken.split('.');
    if (tokenParts.length !== 3) {
      console.log('❌ Invalid JWT token format');
      return;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    console.log('\n📧 Token Payload:');
    console.log('Email:', payload.email);
    console.log('Name:', payload.name);
    console.log('Verified:', payload.email_verified);
    console.log('Issuer:', payload.iss);
    console.log('Audience:', payload.aud);
    
    console.log(`\n✅ Correct entity ID should be: ${payload.email}`);
    
  } catch (error) {
    console.error('❌ Failed to decode token:', error.message);
  }
}

checkTokenContents();