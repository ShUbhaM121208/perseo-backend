// List actual available Gmail tools with their exact names
import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function listActualGmailTools() {
  console.log('📋 Listing ACTUAL Gmail Tools Available...');
  
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
    
    const entityId = 'shubhamm.0010@gmail.com';
    
    const tools = await composio.tools.get(entityId, { toolkits: ['GMAIL'] });
    
    console.log(`\nFound ${tools.length} Gmail tools:\n`);
    
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.slug}`);
      console.log(`   Name: ${tool.name || 'N/A'}`);
      console.log(`   Description: ${tool.description || 'N/A'}`);
      console.log('   ---');
    });
    
    // Look for tools that might handle drafts
    console.log('\n🔍 Tools that might handle DRAFTS:');
    const draftTools = tools.filter(tool => 
      tool.slug.toLowerCase().includes('draft') ||
      tool.name?.toLowerCase().includes('draft') ||
      tool.description?.toLowerCase().includes('draft') ||
      tool.slug.toLowerCase().includes('compose') ||
      tool.slug.toLowerCase().includes('create')
    );
    
    if (draftTools.length > 0) {
      draftTools.forEach(tool => {
        console.log(`✅ ${tool.slug} - ${tool.description}`);
      });
    } else {
      console.log('❌ No draft-related tools found');
    }
    
    // Look for tools that might handle sending
    console.log('\n📧 Tools that might handle SENDING:');
    const sendTools = tools.filter(tool => 
      tool.slug.toLowerCase().includes('send') ||
      tool.name?.toLowerCase().includes('send') ||
      tool.description?.toLowerCase().includes('send')
    );
    
    if (sendTools.length > 0) {
      sendTools.forEach(tool => {
        console.log(`✅ ${tool.slug} - ${tool.description}`);
      });
    } else {
      console.log('❌ No send-related tools found');
    }
    
  } catch (error) {
    console.error('❌ Failed to list tools:', error.message);
  }
}

listActualGmailTools();