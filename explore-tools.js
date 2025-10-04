// Simple approach to discover tools using execute approach
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function exploreComposioAPI() {
  console.log('🔍 Exploring Composio API structure...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    console.log('📋 Composio object properties:');
    console.log(Object.keys(composio));
    
    // Try to get entity information
    const entityId = 'shubhamm.0010@gmail.com';
    
    // Method: Use the execute approach we know works but try common Gmail tools
    console.log('\n🧪 Testing common Gmail tool names...\n');
    
    const commonGmailTools = [
      'GMAIL_SEND_EMAIL',
      'GMAIL_CREATE_DRAFT',
      'GMAIL_COMPOSE_EMAIL',
      'GMAIL_DRAFT',
      'GMAIL_SEND',
      'GMAIL_REPLY',
      'GMAIL_REPLY_TO_EMAIL',
      'GMAIL_MODIFY_LABELS',
      'GMAIL_ADD_LABEL',
      'GMAIL_MOVE_EMAIL',
      'GMAIL_GET_MESSAGE',
      'GMAIL_READ_EMAIL',
      'GMAIL_FETCH_EMAIL',
      'gmail_send_email',
      'gmail_create_draft',
      'gmail_compose_email',
      'gmail_draft',
      'gmail_send',
      'gmail_reply',
      'gmail_reply_to_email',
      'gmail_modify_labels',
      'gmail_add_label',
      'gmail_move_email',
      'gmail_get_message',
      'gmail_read_email',
      'gmail_fetch_email'
    ];
    
    for (const toolName of commonGmailTools) {
      try {
        console.log(`Testing: ${toolName}...`);
        
        // Just try to get tool info without executing
        const result = await composio.execute(entityId, toolName, {});
        console.log(`✅ ${toolName} - Tool exists! (may have failed execution due to missing params)`);
        
      } catch (error) {
        if (error.message.includes('Tool not found') || error.message.includes('404')) {
          console.log(`❌ ${toolName} - Tool not found`);
        } else if (error.message.includes('parameter') || error.message.includes('required')) {
          console.log(`✅ ${toolName} - Tool exists! (failed due to missing required parameters)`);
        } else {
          console.log(`⚠️ ${toolName} - Unknown error: ${error.message.substring(0, 100)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

exploreComposioAPI();