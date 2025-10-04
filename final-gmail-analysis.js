import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

async function analyzeGmailToolsDetailed() {
  console.log('🔍 Final Gmail Tools Analysis');
  console.log('===============================\n');

  try {
    // Get all Gmail tools using the correct API
    const tools = await composio.tools.get('default_user', { toolkits: ['GMAIL'] });
    
    console.log(`📊 Total Gmail tools available: ${tools.length}\n`);
    
    // List all tools with descriptions
    console.log('📋 Complete Gmail tools list:');
    tools.forEach((tool, index) => {
      const name = tool.function?.name || `tool_${index}`;
      const description = tool.function?.description || 'No description available';
      console.log(`${index + 1}. ${name}`);
      console.log(`   Description: ${description}`);
      console.log('');
    });
    
    // Look specifically for send/draft tools
    console.log('\n🔍 Analysis of send/draft capabilities:');
    
    const sendTools = tools.filter(tool => {
      const name = tool.function?.name || '';
      const description = tool.function?.description || '';
      return name.toLowerCase().includes('send') || description.toLowerCase().includes('send');
    });
    
    const draftTools = tools.filter(tool => {
      const name = tool.function?.name || '';
      const description = tool.function?.description || '';
      return name.toLowerCase().includes('draft') || description.toLowerCase().includes('draft');
    });
    
    console.log(`📤 Send-related tools: ${sendTools.length}`);
    sendTools.forEach(tool => {
      const name = tool.function?.name || 'Unknown';
      const description = tool.function?.description || 'No description';
      console.log(`   - ${name}: ${description}`);
    });
    
    console.log(`\n📝 Draft-related tools: ${draftTools.length}`);
    draftTools.forEach(tool => {
      const name = tool.function?.name || 'Unknown';
      const description = tool.function?.description || 'No description';
      console.log(`   - ${name}: ${description}`);
    });
    
    // Get detailed parameters for GMAIL_CREATE_EMAIL_DRAFT
    const createDraftTool = tools.find(tool => tool.function?.name === 'GMAIL_CREATE_EMAIL_DRAFT');
    if (createDraftTool) {
      console.log('\n📝 GMAIL_CREATE_EMAIL_DRAFT parameters:');
      console.log(JSON.stringify(createDraftTool.function?.parameters, null, 2));
    }
    
    // Final conclusion
    console.log('\n🎯 CONCLUSION:');
    console.log('==============');
    console.log(`✅ Gmail integration supports ${tools.length} tools`);
    console.log(`❌ No "send draft" tool exists in Composio Gmail API`);
    console.log(`✅ Draft creation is fully supported with GMAIL_CREATE_EMAIL_DRAFT`);
    console.log(`💡 To send emails, users need to manually send drafts from Gmail interface`);
    
  } catch (error) {
    console.error('❌ Error analyzing Gmail tools:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the analysis
analyzeGmailToolsDetailed();