// Test the exact draft creation that's failing
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function testDraftCreation() {
  console.log('📝 Testing Draft Creation...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const entityId = 'shubhamm.0010@gmail.com';
    
    // Test the exact parameters from your route
    const draftParams = {
      recipient_email: 'test@example.com',
      subject: 'Test Draft from Perseo',
      body: 'This is a test draft email content',
      html: false
    };
    
    console.log('Entity ID:', entityId);
    console.log('Parameters:', JSON.stringify(draftParams, null, 2));
    
    // Try each tool one by one to see which one fails
    const toolsToTry = [
      'GMAIL_CREATE_DRAFT',
      'GMAIL_SAVE_DRAFT', 
      'GMAIL_DRAFT_EMAIL',
      'GMAIL_COMPOSE_DRAFT'
    ];
    
    for (const toolName of toolsToTry) {
      console.log(`\n🔧 Trying tool: ${toolName}`);
      
      try {
        const result = await composio.tools.execute(toolName, {
          userId: entityId,
          arguments: draftParams
        });
        
        console.log(`✅ ${toolName} - SUCCESS!`);
        console.log('Result:', JSON.stringify(result, null, 2));
        break; // Stop on first success
        
      } catch (toolError) {
        console.log(`❌ ${toolName} - FAILED:`, toolError.message);
        if (toolError.cause) {
          console.log('Cause:', toolError.cause);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDraftCreation();