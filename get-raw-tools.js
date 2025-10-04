// Get Gmail tools using getRawComposioTools method
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function getRawGmailTools() {
  console.log('🔍 Getting raw Gmail tools...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    // Method 1: Get raw Composio tools
    console.log('📋 Getting raw Composio tools...');
    try {
      const rawTools = await composio.tools.getRawComposioTools();
      console.log(`✅ Found ${rawTools?.length || 0} raw tools`);
      
      if (rawTools && rawTools.length > 0) {
        // Filter Gmail tools
        const gmailTools = rawTools.filter(tool => 
          (tool.name && tool.name.toLowerCase().includes('gmail')) ||
          (tool.description && tool.description.toLowerCase().includes('gmail')) ||
          (tool.slug && tool.slug.toLowerCase().includes('gmail'))
        );
        
        console.log(`\n📧 Found ${gmailTools.length} Gmail-related tools:`);
        
        gmailTools.forEach((tool, index) => {
          console.log(`${index + 1}. ${tool.slug || tool.name || 'Unknown'}`);
          console.log(`   Name: ${tool.name || 'N/A'}`);
          console.log(`   Description: ${tool.description || 'N/A'}`);
          if (tool.parameters) {
            const paramKeys = Object.keys(tool.parameters);
            console.log(`   Parameters: ${paramKeys.length > 0 ? paramKeys.join(', ') : 'None'}`);
          }
          console.log('   ---');
        });
        
        // Categorize the Gmail tools
        console.log('\n📝 DRAFT-related tools:');
        const draftTools = gmailTools.filter(tool => 
          (tool.slug && tool.slug.toLowerCase().includes('draft')) ||
          (tool.name && tool.name.toLowerCase().includes('draft')) ||
          (tool.slug && tool.slug.toLowerCase().includes('compose')) ||
          (tool.name && tool.name.toLowerCase().includes('compose'))
        );
        if (draftTools.length > 0) {
          draftTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
        } else {
          console.log('❌ No draft-related tools found');
        }
        
        console.log('\n📤 SEND-related tools:');
        const sendTools = gmailTools.filter(tool => 
          (tool.slug && tool.slug.toLowerCase().includes('send')) ||
          (tool.name && tool.name.toLowerCase().includes('send'))
        );
        if (sendTools.length > 0) {
          sendTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
        } else {
          console.log('❌ No send-related tools found');
        }
        
        console.log('\n↩️ REPLY-related tools:');
        const replyTools = gmailTools.filter(tool => 
          (tool.slug && tool.slug.toLowerCase().includes('reply')) ||
          (tool.name && tool.name.toLowerCase().includes('reply'))
        );
        if (replyTools.length > 0) {
          replyTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
        } else {
          console.log('❌ No reply-related tools found');
        }
        
        console.log('\n🏷️ LABEL-related tools:');
        const labelTools = gmailTools.filter(tool => 
          (tool.slug && tool.slug.toLowerCase().includes('label')) ||
          (tool.name && tool.name.toLowerCase().includes('label'))
        );
        if (labelTools.length > 0) {
          labelTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
        } else {
          console.log('❌ No label-related tools found');
        }
        
        console.log('\n📁 MOVE/FOLDER-related tools:');
        const moveTools = gmailTools.filter(tool => 
          (tool.slug && (tool.slug.toLowerCase().includes('move') || tool.slug.toLowerCase().includes('folder'))) ||
          (tool.name && (tool.name.toLowerCase().includes('move') || tool.name.toLowerCase().includes('folder')))
        );
        if (moveTools.length > 0) {
          moveTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
        } else {
          console.log('❌ No move/folder-related tools found');
        }
        
        console.log('\n📧 GET/FETCH message tools:');
        const getTools = gmailTools.filter(tool => 
          (tool.slug && (tool.slug.toLowerCase().includes('get') || tool.slug.toLowerCase().includes('fetch') || tool.slug.toLowerCase().includes('read'))) ||
          (tool.name && (tool.name.toLowerCase().includes('get') || tool.name.toLowerCase().includes('fetch') || tool.name.toLowerCase().includes('read')))
        );
        if (getTools.length > 0) {
          getTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
        } else {
          console.log('❌ No get/fetch-related tools found');
        }
        
      } else {
        console.log('❌ No raw tools found');
      }
      
    } catch (error) {
      console.error('❌ Failed to get raw tools:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

getRawGmailTools();