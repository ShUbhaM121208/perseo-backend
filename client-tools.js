// Direct approach using the Composio client
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function useComposioClient() {
  console.log('🔍 Using Composio client directly...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    // Access the client directly
    console.log('📋 Using Composio client...');
    const client = composio.client;
    
    console.log('Client properties:');
    console.log(Object.keys(client));
    
    // Try to get apps
    console.log('\n🧪 Getting apps...');
    try {
      const apps = await client.apps.list();
      console.log(`✅ Found ${apps.data?.length || 0} apps`);
      
      const gmailApp = apps.data?.find(app => 
        app.name?.toLowerCase().includes('gmail') || 
        app.slug?.toLowerCase().includes('gmail')
      );
      
      if (gmailApp) {
        console.log(`✅ Gmail app found: ${gmailApp.name} (${gmailApp.slug})`);
        
        // Try to get tools for Gmail
        console.log('\n🧪 Getting tools for Gmail...');
        try {
          const tools = await client.tools.list({
            appNames: ['gmail']
          });
          
          console.log(`✅ Found ${tools.data?.length || 0} Gmail tools`);
          
          if (tools.data && tools.data.length > 0) {
            console.log('\n📧 Gmail Tools:');
            tools.data.forEach((tool, index) => {
              console.log(`${index + 1}. ${tool.slug || tool.name}`);
              console.log(`   Name: ${tool.name || 'N/A'}`);
              console.log(`   Description: ${tool.description || 'N/A'}`);
              
              // Show parameters if available
              if (tool.parameters && Object.keys(tool.parameters).length > 0) {
                console.log(`   Parameters:`);
                Object.keys(tool.parameters).forEach(param => {
                  console.log(`     - ${param}: ${tool.parameters[param].description || 'No description'}`);
                });
              }
              console.log('   ---');
            });
            
            // Categorize tools by functionality
            console.log('\n📝 DRAFT-related tools:');
            const draftTools = tools.data.filter(tool => 
              (tool.slug && tool.slug.toLowerCase().includes('draft')) ||
              (tool.name && tool.name.toLowerCase().includes('draft')) ||
              (tool.description && tool.description.toLowerCase().includes('draft'))
            );
            if (draftTools.length > 0) {
              draftTools.forEach(tool => console.log(`✅ ${tool.slug}`));
            } else {
              console.log('❌ No draft-related tools found');
            }
            
            console.log('\n📤 SEND-related tools:');
            const sendTools = tools.data.filter(tool => 
              (tool.slug && tool.slug.toLowerCase().includes('send')) ||
              (tool.name && tool.name.toLowerCase().includes('send')) ||
              (tool.description && tool.description.toLowerCase().includes('send'))
            );
            if (sendTools.length > 0) {
              sendTools.forEach(tool => console.log(`✅ ${tool.slug}`));
            } else {
              console.log('❌ No send-related tools found');
            }
            
            console.log('\n↩️ REPLY-related tools:');
            const replyTools = tools.data.filter(tool => 
              (tool.slug && tool.slug.toLowerCase().includes('reply')) ||
              (tool.name && tool.name.toLowerCase().includes('reply')) ||
              (tool.description && tool.description.toLowerCase().includes('reply'))
            );
            if (replyTools.length > 0) {
              replyTools.forEach(tool => console.log(`✅ ${tool.slug}`));
            } else {
              console.log('❌ No reply-related tools found');
            }
            
            console.log('\n🏷️ LABEL-related tools:');
            const labelTools = tools.data.filter(tool => 
              (tool.slug && tool.slug.toLowerCase().includes('label')) ||
              (tool.name && tool.name.toLowerCase().includes('label')) ||
              (tool.description && tool.description.toLowerCase().includes('label'))
            );
            if (labelTools.length > 0) {
              labelTools.forEach(tool => console.log(`✅ ${tool.slug}`));
            } else {
              console.log('❌ No label-related tools found');
            }
            
            console.log('\n📁 MOVE/MESSAGE management tools:');
            const moveTools = tools.data.filter(tool => 
              (tool.slug && (tool.slug.toLowerCase().includes('move') || tool.slug.toLowerCase().includes('message'))) ||
              (tool.name && (tool.name.toLowerCase().includes('move') || tool.name.toLowerCase().includes('message'))) ||
              (tool.description && (tool.description.toLowerCase().includes('move') || tool.description.toLowerCase().includes('message')))
            );
            if (moveTools.length > 0) {
              moveTools.forEach(tool => console.log(`✅ ${tool.slug}`));
            } else {
              console.log('❌ No move/message tools found');
            }
            
            console.log('\n📧 GET/READ message tools:');
            const getTools = tools.data.filter(tool => 
              (tool.slug && (tool.slug.toLowerCase().includes('get') || tool.slug.toLowerCase().includes('read') || tool.slug.toLowerCase().includes('fetch'))) ||
              (tool.name && (tool.name.toLowerCase().includes('get') || tool.name.toLowerCase().includes('read') || tool.name.toLowerCase().includes('fetch')))
            );
            if (getTools.length > 0) {
              getTools.forEach(tool => console.log(`✅ ${tool.slug}`));
            } else {
              console.log('❌ No get/read tools found');
            }
            
          } else {
            console.log('❌ No Gmail tools found');
          }
          
        } catch (error) {
          console.error('❌ Failed to get Gmail tools:', error.message);
        }
        
      } else {
        console.log('❌ Gmail app not found');
      }
      
    } catch (error) {
      console.error('❌ Failed to get apps:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

useComposioClient();