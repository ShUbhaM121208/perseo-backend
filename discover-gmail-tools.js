// Discover actual Gmail tools using multiple API approaches
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function discoverGmailTools() {
  console.log('🔍 Discovering actual Gmail tools in Composio...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    // Method 1: List all apps first
    console.log('📋 Method 1: Listing all available apps...');
    try {
      const apps = await composio.apps.list();
      console.log(`Found ${apps.data?.length} apps:`);
      const gmailApp = apps.data?.find(app => app.name?.toLowerCase().includes('gmail'));
      if (gmailApp) {
        console.log(`✅ Gmail app found: ${gmailApp.name} (${gmailApp.key})`);
      }
    } catch (error) {
      console.error('❌ Failed to list apps:', error.message);
    }
    
    // Method 2: Get Gmail tools directly
    console.log('\n📋 Method 2: Getting Gmail tools...');
    try {
      const tools = await composio.tools.list({
        appNames: ['gmail']
      });
      
      console.log(`Found ${tools.data?.length || 0} Gmail tools:\n`);
      
      if (tools.data && tools.data.length > 0) {
        tools.data.forEach((tool, index) => {
          console.log(`${index + 1}. ${tool.slug || tool.name || 'Unknown'}`);
          console.log(`   Name: ${tool.name || 'N/A'}`);
          console.log(`   Description: ${tool.description || 'N/A'}`);
          if (tool.parameters) {
            console.log(`   Parameters: ${JSON.stringify(tool.parameters, null, 2)}`);
          }
          console.log('   ---');
        });
        
        // Look for specific tool patterns
        console.log('\n📝 DRAFT-related tools:');
        const draftTools = tools.data.filter(tool => 
          (tool.slug && tool.slug.toLowerCase().includes('draft')) ||
          (tool.slug && tool.slug.toLowerCase().includes('compose')) ||
          (tool.slug && tool.slug.toLowerCase().includes('create'))
        );
        if (draftTools.length > 0) {
          draftTools.forEach(tool => console.log(`✅ ${tool.slug}`));
        } else {
          console.log('❌ No draft-related tools found');
        }
        
        console.log('\n📤 SEND-related tools:');
        const sendTools = tools.data.filter(tool => 
          tool.slug && tool.slug.toLowerCase().includes('send')
        );
        if (sendTools.length > 0) {
          sendTools.forEach(tool => console.log(`✅ ${tool.slug}`));
        } else {
          console.log('❌ No send-related tools found');
        }
        
        console.log('\n↩️ REPLY-related tools:');
        const replyTools = tools.data.filter(tool => 
          tool.slug && tool.slug.toLowerCase().includes('reply')
        );
        if (replyTools.length > 0) {
          replyTools.forEach(tool => console.log(`✅ ${tool.slug}`));
        } else {
          console.log('❌ No reply-related tools found');
        }
        
        console.log('\n🏷️ LABEL-related tools:');
        const labelTools = tools.data.filter(tool => 
          tool.slug && tool.slug.toLowerCase().includes('label')
        );
        if (labelTools.length > 0) {
          labelTools.forEach(tool => console.log(`✅ ${tool.slug}`));
        } else {
          console.log('❌ No label-related tools found');
        }
        
        console.log('\n📁 MOVE/FOLDER-related tools:');
        const moveTools = tools.data.filter(tool => 
          tool.slug && (tool.slug.toLowerCase().includes('move') ||
          tool.slug.toLowerCase().includes('folder'))
        );
        if (moveTools.length > 0) {
          moveTools.forEach(tool => console.log(`✅ ${tool.slug}`));
        } else {
          console.log('❌ No move/folder-related tools found');
        }
        
        console.log('\n📧 GET/FETCH message tools:');
        const getTools = tools.data.filter(tool => 
          tool.slug && (tool.slug.toLowerCase().includes('get') ||
          tool.slug.toLowerCase().includes('fetch') ||
          tool.slug.toLowerCase().includes('read'))
        );
        if (getTools.length > 0) {
          getTools.forEach(tool => console.log(`✅ ${tool.slug}`));
        } else {
          console.log('❌ No get/fetch-related tools found');
        }
      } else {
        console.log('❌ No Gmail tools found');
      }
      
    } catch (error) {
      console.error('❌ Method 2 failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

discoverGmailTools();