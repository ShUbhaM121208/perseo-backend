// Access tools directly through the client
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function accessToolsDirectly() {
  console.log('🔍 Accessing tools directly through client...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const client = composio.client;
    
    // Check tools object
    console.log('📋 Client.tools properties:');
    if (client.tools) {
      console.log(Object.keys(client.tools));
      
      // Try list method
      console.log('\n🧪 Trying client.tools.list...');
      try {
        const tools = await client.tools.list();
        console.log(`✅ tools.list() works - result type: ${typeof tools}`);
        console.log(`✅ Found ${tools.data?.length || 0} tools`);
        
        if (tools.data && tools.data.length > 0) {
          // Filter for Gmail tools
          const gmailTools = tools.data.filter(tool => 
            (tool.name && tool.name.toLowerCase().includes('gmail')) ||
            (tool.description && tool.description.toLowerCase().includes('gmail')) ||
            (tool.slug && tool.slug.toLowerCase().includes('gmail')) ||
            (tool.appName && tool.appName.toLowerCase().includes('gmail'))
          );
          
          console.log(`\n📧 Found ${gmailTools.length} Gmail tools:`);
          
          if (gmailTools.length > 0) {
            gmailTools.forEach((tool, index) => {
              console.log(`${index + 1}. ${tool.slug || tool.name}`);
              console.log(`   Name: ${tool.name || 'N/A'}`);
              console.log(`   Description: ${tool.description || 'N/A'}`);
              console.log(`   App: ${tool.appName || 'N/A'}`);
              
              // Show key parameters
              if (tool.parameters) {
                const paramKeys = Object.keys(tool.parameters);
                if (paramKeys.length > 0) {
                  console.log(`   Key Parameters: ${paramKeys.slice(0, 3).join(', ')}${paramKeys.length > 3 ? '...' : ''}`);
                }
              }
              console.log('   ---');
            });
            
            // Show the correct tool names we need to use
            console.log('\n🎯 CORRECT TOOL NAMES TO USE:');
            console.log('\n📝 For DRAFTS:');
            gmailTools.filter(tool => 
              tool.slug && (tool.slug.toLowerCase().includes('draft') || tool.slug.toLowerCase().includes('compose'))
            ).forEach(tool => console.log(`✅ ${tool.slug}`));
            
            console.log('\n📤 For SENDING:');
            gmailTools.filter(tool => 
              tool.slug && tool.slug.toLowerCase().includes('send')
            ).forEach(tool => console.log(`✅ ${tool.slug}`));
            
            console.log('\n↩️ For REPLIES:');
            gmailTools.filter(tool => 
              tool.slug && tool.slug.toLowerCase().includes('reply')
            ).forEach(tool => console.log(`✅ ${tool.slug}`));
            
            console.log('\n🏷️ For LABELS:');
            gmailTools.filter(tool => 
              tool.slug && tool.slug.toLowerCase().includes('label')
            ).forEach(tool => console.log(`✅ ${tool.slug}`));
            
            console.log('\n📁 For MOVING/MESSAGES:');
            gmailTools.filter(tool => 
              tool.slug && (tool.slug.toLowerCase().includes('move') || tool.slug.toLowerCase().includes('message'))
            ).forEach(tool => console.log(`✅ ${tool.slug}`));
            
            console.log('\n📧 For GETTING MESSAGES:');
            gmailTools.filter(tool => 
              tool.slug && (tool.slug.toLowerCase().includes('get') || tool.slug.toLowerCase().includes('read') || tool.slug.toLowerCase().includes('fetch'))
            ).forEach(tool => console.log(`✅ ${tool.slug}`));
            
          } else {
            console.log('❌ No Gmail tools found in the list');
            
            // Show first 10 tools as sample
            console.log('\n📋 Sample of available tools:');
            tools.data.slice(0, 10).forEach((tool, index) => {
              console.log(`${index + 1}. ${tool.slug || tool.name} (${tool.appName || 'Unknown app'})`);
            });
          }
          
        } else {
          console.log('❌ No tools data found');
        }
        
      } catch (error) {
        console.error('❌ client.tools.list failed:', error.message);
      }
      
    } else {
      console.log('❌ client.tools not available');
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

accessToolsDirectly();