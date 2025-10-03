// Test the working approach - try to execute and catch errors to find real tool names
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function findWorkingTools() {
  console.log('🔍 Finding working tools through execution attempts...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const entityId = 'shubhamm.0010@gmail.com';
    
    // Let's try Gmail tools with different naming patterns
    const potentialTools = [
      // Standard naming
      'GMAIL_SEND_EMAIL',
      'GMAIL_CREATE_DRAFT', 
      'GMAIL_GET_MESSAGE',
      'GMAIL_REPLY_TO_EMAIL',
      'GMAIL_MODIFY_LABELS',
      'GMAIL_MOVE_EMAIL',
      
      // Alternative naming
      'gmail_send_email',
      'gmail_create_draft',
      'gmail_get_message', 
      'gmail_reply_to_email',
      'gmail_modify_labels',
      'gmail_move_email',
      
      // Other possible patterns
      'SEND_EMAIL',
      'CREATE_DRAFT',
      'GET_MESSAGE',
      'REPLY_TO_EMAIL', 
      'MODIFY_LABELS',
      'MOVE_EMAIL',
      
      // Composio style naming (based on other integrations)
      'gmail_send_mail',
      'gmail_compose_email',
      'gmail_read_message',
      'gmail_reply_message',
      'gmail_update_labels',
      'gmail_move_message',
      
      // Check if tools exist without GMAIL prefix
      'send_email',
      'create_draft',
      'get_message',
      'reply_to_email',
      'modify_labels', 
      'move_email',
      
      // Alternative patterns
      'gmail-send-email',
      'gmail-create-draft',
      'gmail-get-message',
      'gmail-reply-to-email',
      'gmail-modify-labels',
      'gmail-move-email'
    ];
    
    console.log('🧪 Testing potential Gmail tool names...\n');
    
    const workingTools = [];
    const notFoundTools = [];
    const errorTools = [];
    
    for (const toolName of potentialTools) {
      try {
        console.log(`Testing: ${toolName}...`);
        
        // Try to execute with minimal parameters
        const result = await composio.tools.execute({
          toolName: toolName,
          entityId: entityId,
          input: {}
        });
        
        console.log(`✅ ${toolName} - WORKS! (execution may have failed due to missing params)`);
        workingTools.push(toolName);
        
      } catch (error) {
        if (error.message.includes('Tool not found') || error.message.includes('404')) {
          console.log(`❌ ${toolName} - Not found`);
          notFoundTools.push(toolName);
        } else if (error.message.includes('required') || error.message.includes('parameter') || error.message.includes('validation')) {
          console.log(`✅ ${toolName} - WORKS! (failed due to missing required parameters)`);
          workingTools.push(toolName);
        } else {
          console.log(`⚠️ ${toolName} - Error: ${error.message.substring(0, 80)}...`);
          errorTools.push({name: toolName, error: error.message.substring(0, 100)});
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 RESULTS SUMMARY:');
    console.log(`✅ Working tools found: ${workingTools.length}`);
    console.log(`❌ Not found tools: ${notFoundTools.length}`);
    console.log(`⚠️ Error tools: ${errorTools.length}`);
    
    if (workingTools.length > 0) {
      console.log('\n🎯 WORKING GMAIL TOOLS:');
      workingTools.forEach(tool => console.log(`✅ ${tool}`));
      
      console.log('\n💡 Use these tool names in your backend routes!');
    }
    
    if (errorTools.length > 0) {
      console.log('\n⚠️ TOOLS WITH ERRORS (might still work):');
      errorTools.forEach(item => console.log(`⚠️ ${item.name}: ${item.error}`));
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

findWorkingTools();