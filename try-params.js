// Try different parameters for tools.list
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function tryDifferentParameters() {
  console.log('🔍 Trying different parameters for tools.list...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const client = composio.client;
    
    // Try different parameters
    console.log('🧪 Method 1: tools.list() with no parameters...');
    try {
      const tools1 = await client.tools.list();
      console.log(`Result: ${tools1.data?.length || 0} tools`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    
    console.log('\n🧪 Method 2: tools.list() with appNames parameter...');
    try {
      const tools2 = await client.tools.list({ appNames: ['gmail'] });
      console.log(`Result: ${tools2.data?.length || 0} tools`);
      if (tools2.data && tools2.data.length > 0) {
        console.log('First few Gmail tools:');
        tools2.data.slice(0, 5).forEach(tool => {
          console.log(`- ${tool.slug || tool.name}`);
        });
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    
    console.log('\n🧪 Method 3: tools.list() with apps parameter...');
    try {
      const tools3 = await client.tools.list({ apps: ['gmail'] });
      console.log(`Result: ${tools3.data?.length || 0} tools`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    
    console.log('\n🧪 Method 4: Check toolkits...');
    try {
      const toolkits = await client.toolkits.list();
      console.log(`Result: ${toolkits.data?.length || 0} toolkits`);
      
      // Find Gmail toolkit
      const gmailToolkit = toolkits.data?.find(tk => 
        tk.name?.toLowerCase().includes('gmail') || 
        tk.key?.toLowerCase().includes('gmail')
      );
      
      if (gmailToolkit) {
        console.log(`✅ Found Gmail toolkit: ${gmailToolkit.name} (${gmailToolkit.key})`);
        
        // Try to get tools for this toolkit
        console.log('\n🧪 Method 5: Get tools for Gmail toolkit...');
        try {
          const gmailTools = await client.tools.list({ toolkits: [gmailToolkit.key] });
          console.log(`Gmail toolkit tools: ${gmailTools.data?.length || 0}`);
          
          if (gmailTools.data && gmailTools.data.length > 0) {
            console.log('\n📧 Gmail Tools Found:');
            gmailTools.data.forEach((tool, index) => {
              console.log(`${index + 1}. ${tool.slug || tool.name}`);
              console.log(`   Name: ${tool.name || 'N/A'}`);
              console.log(`   Description: ${tool.description || 'N/A'}`);
              console.log('   ---');
            });
          }
        } catch (error) {
          console.log(`❌ Failed to get toolkit tools: ${error.message}`);
        }
      } else {
        console.log('❌ Gmail toolkit not found');
        console.log('Available toolkits:');
        toolkits.data?.slice(0, 10).forEach(tk => {
          console.log(`- ${tk.name} (${tk.key})`);
        });
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    
    // Try the working execute approach to verify connection
    console.log('\n🧪 Method 6: Verify connection with execute...');
    try {
      // Just test with a simple tool that we know should exist
      await composio.tools.execute({
        toolName: 'SOME_INVALID_TOOL',
        entityId: 'shubhamm.0010@gmail.com',
        input: {}
      });
    } catch (error) {
      if (error.message.includes('Tool not found')) {
        console.log('✅ Connection works - tool validation is working');
      } else {
        console.log(`⚠️ Different error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

tryDifferentParameters();