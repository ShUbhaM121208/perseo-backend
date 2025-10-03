import express from 'express';
import composio from '../composio/client';
import { callGemini } from '../services/gemini';

const router = express.Router();

// POST /chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    console.log('Chat request received:', { userId, message });

    // Step 2: Use composio.tools.get(userId, { toolkits: ['GMAIL'] }) to fetch Gmail tool schema
    const tools = await composio.tools.get(userId, { toolkits: ['GMAIL'] });

    console.log('Retrieved Gmail tools for user:', userId);
    console.log('Available tools count:', tools.length);
    
    // Debug: Log first tool structure to understand the format
    if (tools.length > 0) {
      console.log('First tool structure:', JSON.stringify(tools[0], null, 2));
    }

    // Step 3: Call Gemini to process the user message and determine tool calls
    console.log('Calling Gemini to process message:', message);
    
    let geminiResponse: any;
    try {
      geminiResponse = await callGemini(message, tools);
      console.log('Gemini response:', geminiResponse);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      // Fallback response if Gemini fails
      geminiResponse = {
        reply: `I received your message: "${message}". I have access to ${tools.length} Gmail tools to help you, but I'm having trouble processing your request right now.`,
        toolCalls: null
      };
    }

    let toolResult = null;

    // Step 4: If we have tool calls → execute them
    if (geminiResponse.toolCalls && geminiResponse.toolCalls.length > 0) {
      try {
        const toolCall = geminiResponse.toolCalls[0];
        console.log('Executing tool:', toolCall.tool);
        console.log('With arguments:', toolCall.arguments);
        
        toolResult = await composio.tools.execute(
          toolCall.tool,
          {
            userId: userId,
            arguments: toolCall.arguments
          }
        );
        console.log('Tool execution result:', toolResult);
      } catch (error) {
        console.error('Tool execution error:', error);
        toolResult = { 
          successful: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    // Step 5: Return JSON { reply, toolResult } with appropriate success message
    let finalReply = geminiResponse.reply;
    
    if (toolResult) {
      if (toolResult.successful) {
        const toolCall = geminiResponse.toolCalls[0];
        
        if (toolCall.tool === 'GMAIL_SEND_EMAIL') {
          // Handle email sending success
          const recipientMatch = message.match(/send email to\s+([^\s]+)/i);
          const recipient = recipientMatch ? recipientMatch[1] : 'recipient';
          finalReply = `✅ Email sent to ${recipient}`;
        } else if (toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          // Handle email listing success - Return a simplified list: sender, subject, snippet, date
          const messagesData = (toolResult.data as any)?.messages || toolResult.data || [];
          const messages = Array.isArray(messagesData) ? messagesData : [];
          console.log('Retrieved messages count:', messages.length);
          console.log('First message sample:', messages[0]);
          
          const isUnreadQuery = toolCall.arguments.query === 'is:unread';
          const isSearchQuery = toolCall.arguments.query && toolCall.arguments.query !== 'is:unread' && toolCall.arguments.query !== '';
          const queryType = isUnreadQuery ? 'unread' : (isSearchQuery ? 'search' : 'inbox');
          
          if (messages.length === 0) {
            if (isSearchQuery) {
              finalReply = `🔍 No emails found matching "${toolCall.arguments.query}"`;
            } else {
              finalReply = `📭 No ${queryType} messages found`;
            }
          } else {
            let emailList: string;
            if (isSearchQuery) {
              emailList = `🔍 Found ${messages.length} emails matching "${toolCall.arguments.query}":\n\n`;
            } else {
              emailList = `📧 Found ${messages.length} ${queryType} messages:\n\n`;
            }
            
            messages.slice(0, 5).forEach((msg: any, index: number) => {
              console.log(`Processing message ${index + 1}:`, Object.keys(msg));
              const sender = msg.sender || msg.from || msg.fromEmail || 'Unknown Sender';
              const subject = msg.subject || msg.title || 'No Subject';
              const snippet = msg.preview?.body || msg.messageText || msg.snippet || msg.body || msg.content || 'No preview';
              const date = msg.messageTimestamp || msg.date || msg.timestamp || msg.receivedAt || 'Unknown Date';
              
              // Clean up the snippet
              const cleanSnippet = snippet.substring(0, 100).replace(/\r?\n/g, ' ').trim();
              
              emailList += `${index + 1}. **From:** ${sender}\n`;
              emailList += `   **Subject:** ${subject}\n`;
              emailList += `   **Preview:** ${cleanSnippet}...\n`;
              emailList += `   **Date:** ${date}\n\n`;
            });
            
            if (messages.length > 5) {
              emailList += `... and ${messages.length - 5} more messages`;
            }
            
            console.log('Final email list reply:', emailList);
            finalReply = emailList;
          }
        }
      } else {
        finalReply = `❌ Failed to execute ${geminiResponse.toolCalls[0].tool}: ${toolResult.error}`;
      }
    }

    return res.json({
      reply: finalReply,
      toolResult: toolResult
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;