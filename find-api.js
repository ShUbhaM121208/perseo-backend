// Final attempt to get Gmail tools using the correct API structure
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function findCorrectAPI() {
  console.log('🔍 Finding correct Composio API structure...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const entityId = 'shubhamm.0010@gmail.com';
    
    // Explore tools object
    console.log('📋 Tools object methods:');
    if (composio.tools) {
      console.log(Object.keys(composio.tools));
      
      // Try different methods to get tools
      console.log('\n🧪 Trying tools.get...');
      try {
        const tools1 = await composio.tools.get();
        console.log(`✅ tools.get() works - found ${tools1?.length || 'unknown'} tools`);
      } catch (error) {
        console.log(`❌ tools.get() failed: ${error.message}`);
      }
      
      console.log('\n🧪 Trying tools.list...');
      try {
        const tools2 = await composio.tools.list();
        console.log(`✅ tools.list() works - found tools object:`, typeof tools2);
      } catch (error) {
        console.log(`❌ tools.list() failed: ${error.message}`);
      }
      
      console.log('\n🧪 Trying tools.find...');
      try {
        const tools3 = await composio.tools.find();
        console.log(`✅ tools.find() works`);
      } catch (error) {
        console.log(`❌ tools.find() failed: ${error.message}`);
      }
    }
    
    // Explore toolkits object
    console.log('\n📋 Toolkits object methods:');
    if (composio.toolkits) {
      console.log(Object.keys(composio.toolkits));
      
      console.log('\n🧪 Trying toolkits.get...');
      try {
        const toolkits1 = await composio.toolkits.get();
        console.log(`✅ toolkits.get() works`);
      } catch (error) {
        console.log(`❌ toolkits.get() failed: ${error.message}`);
      }
    }
    
    // Try different execute approaches
    console.log('\n🧪 Trying direct execution with basic tool...');
    try {
      // Try with a simple tool that should exist
      const result = await composio.tools.execute({
        toolName: 'GMAIL_SEND_EMAIL',
        entityId: entityId,
        input: {}
      });
      console.log(`✅ tools.execute works`);
    } catch (error) {
      console.log(`❌ tools.execute failed: ${error.message}`);
    }
    
    // Check connected accounts to see what's available
    console.log('\n🧪 Trying connected accounts...');
    try {
      const accounts = await composio.connectedAccounts.list();
      console.log(`✅ Found ${accounts?.length || 0} connected accounts`);
      if (accounts && accounts.length > 0) {
        const gmailAccount = accounts.find(acc => acc.appName === 'gmail');
        if (gmailAccount) {
          console.log(`✅ Gmail account found: ${gmailAccount.id}`);
          
          // Try to get tools for this specific account
          console.log('\n🧪 Getting tools for Gmail account...');
          try {
            const accountTools = await composio.tools.get({
              connectedAccountId: gmailAccount.id
            });
            console.log(`✅ Found ${accountTools?.length || 0} tools for Gmail account`);
            if (accountTools && accountTools.length > 0) {
              console.log('\n📧 Available Gmail Tools:');
              accountTools.forEach((tool, index) => {
                console.log(`${index + 1}. ${tool.name || tool.slug || tool.actionName || 'Unknown'}`);
              });
            }
          } catch (error) {
            console.log(`❌ Failed to get account tools: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Failed to get connected accounts: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

findCorrectAPI();