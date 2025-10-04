// Get Gmail tools using the correct API methods
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function getActualGmailTools() {
  console.log('🔍 Getting actual Gmail tools using correct API...\n');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    // Method 1: Get all toolkits first
    console.log('📋 Getting all toolkits...');
    try {
      const toolkits = await composio.toolkits.get();
      console.log(`✅ Found ${toolkits?.length || 0} toolkits`);
      
      // Find Gmail toolkit
      const gmailToolkit = toolkits?.find(toolkit => 
        toolkit.name?.toLowerCase().includes('gmail') || 
        toolkit.slug?.toLowerCase().includes('gmail')
      );
      
      if (gmailToolkit) {
        console.log(`✅ Gmail toolkit found: ${gmailToolkit.name} (${gmailToolkit.slug})`);
        console.log(`   Description: ${gmailToolkit.description}`);
        
        // Get tools for Gmail toolkit
        if (gmailToolkit.tools && gmailToolkit.tools.length > 0) {
          console.log(`\n📧 Gmail Tools (${gmailToolkit.tools.length} total):`);
          gmailToolkit.tools.forEach((tool, index) => {
            console.log(`${index + 1}. ${tool.slug || tool.name}`);
            console.log(`   Name: ${tool.name}`);
            console.log(`   Description: ${tool.description || 'N/A'}`);
            console.log('   ---');
          });
          
          // Categorize tools
          console.log('\n📝 DRAFT-related tools:');
          const draftTools = gmailToolkit.tools.filter(tool => 
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
          const sendTools = gmailToolkit.tools.filter(tool => 
            (tool.slug && tool.slug.toLowerCase().includes('send')) ||
            (tool.name && tool.name.toLowerCase().includes('send'))
          );
          if (sendTools.length > 0) {
            sendTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
          } else {
            console.log('❌ No send-related tools found');
          }
          
          console.log('\n↩️ REPLY-related tools:');
          const replyTools = gmailToolkit.tools.filter(tool => 
            (tool.slug && tool.slug.toLowerCase().includes('reply')) ||
            (tool.name && tool.name.toLowerCase().includes('reply'))
          );
          if (replyTools.length > 0) {
            replyTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
          } else {
            console.log('❌ No reply-related tools found');
          }
          
          console.log('\n🏷️ LABEL-related tools:');
          const labelTools = gmailToolkit.tools.filter(tool => 
            (tool.slug && tool.slug.toLowerCase().includes('label')) ||
            (tool.name && tool.name.toLowerCase().includes('label'))
          );
          if (labelTools.length > 0) {
            labelTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
          } else {
            console.log('❌ No label-related tools found');
          }
          
          console.log('\n📁 MOVE/FOLDER-related tools:');
          const moveTools = gmailToolkit.tools.filter(tool => 
            (tool.slug && (tool.slug.toLowerCase().includes('move') || tool.slug.toLowerCase().includes('folder'))) ||
            (tool.name && (tool.name.toLowerCase().includes('move') || tool.name.toLowerCase().includes('folder')))
          );
          if (moveTools.length > 0) {
            moveTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
          } else {
            console.log('❌ No move/folder-related tools found');
          }
          
          console.log('\n📧 GET/FETCH message tools:');
          const getTools = gmailToolkit.tools.filter(tool => 
            (tool.slug && (tool.slug.toLowerCase().includes('get') || tool.slug.toLowerCase().includes('fetch') || tool.slug.toLowerCase().includes('read'))) ||
            (tool.name && (tool.name.toLowerCase().includes('get') || tool.name.toLowerCase().includes('fetch') || tool.name.toLowerCase().includes('read')))
          );
          if (getTools.length > 0) {
            getTools.forEach(tool => console.log(`✅ ${tool.slug} - ${tool.name}`));
          } else {
            console.log('❌ No get/fetch-related tools found');
          }
          
        } else {
          console.log('❌ No tools found in Gmail toolkit');
        }
      } else {
        console.log('❌ Gmail toolkit not found');
        console.log('\n📋 Available toolkits:');
        toolkits?.forEach(toolkit => {
          console.log(`- ${toolkit.name} (${toolkit.slug})`);
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to get toolkits:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio:', error.message);
  }
}

getActualGmailTools();