import express from 'express';
import composio from '../composio/client';

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
              finalReply = `📭 No ${queryType} messages found`;
            }
          } else {
            let emailList: string;
            if (isSearchQuery) {
              emailList = `🔍 Found ${messages.length} emails matching "${toolCall.arguments.query}":\n\n`;
            } else {
              emailList = `📧 Found ${messages.length} ${queryType} messages:\n\n`;
            }:', tools.length);

    // Step 3: Parse message for email sending (simple implementation for testing)
    let geminiResponse: any = {
      reply: `I received your message: "${message}". I have access to ${tools.length} Gmail tools to help you.`,
      toolCalls: null
    };

    // Simple command parsing for testing (replace with actual Gemini later)
    const emailPattern = /send email to\s+([^\s]+)\s+saying\s+(.+)/i;
    const listUnreadPattern = /list unread emails?|show unread|unread messages?|check unread/i;
    const listInboxPattern = /list inbox|show inbox|inbox messages?|check inbox/i;
    const replyPattern = /reply to last email saying\s+(.+)|reply saying\s+(.+)|reply to last\s+(.+)/i;
    const draftsPattern = /list drafts?|show my drafts?|drafts?|my drafts?/i;
    const deletePattern = /delete\s+(?:the\s+)?(?:my\s+)?last\s+email(?:\s+from\s+(.+))?|delete\s+(?:the\s+)?email\s+from\s+(.+)/i;
    const listLabelsPattern = /list labels?|show my labels?|show labels?|what labels?/i;
    const addLabelPattern = /mark\s+(?:this\s+|last\s+)?email\s+as\s+(.+)|add\s+(.+)\s+label\s+to\s+(?:last\s+)?email/i;
    const removeLabelPattern = /remove\s+(.+)\s+(?:label\s+)?from\s+(?:last\s+)?email|unmark\s+(?:last\s+)?email\s+as\s+(.+)/i;
    const searchPattern = /search\s+(?:emails?\s+)?(?:for\s+|about\s+)?(.+)|find\s+emails?\s+(?:about\s+|for\s+)?(.+)|look\s+for\s+emails?\s+(?:about\s+|for\s+)?(.+)/i;
    
    const emailMatch = message.match(emailPattern);
    const listUnreadMatch = message.match(listUnreadPattern);
    const listInboxMatch = message.match(listInboxPattern);
    const replyMatch = message.match(replyPattern);
    const draftsMatch = message.match(draftsPattern);
    const deleteMatch = message.match(deletePattern);
    const listLabelsMatch = message.match(listLabelsPattern);
    const addLabelMatch = message.match(addLabelPattern);
    const removeLabelMatch = message.match(removeLabelPattern);
    const searchMatch = message.match(searchPattern);

    if (emailMatch) {
      const recipient = emailMatch[1];
      const body = emailMatch[2];
      
      console.log('Parsed email command:');
      console.log('- Recipient:', recipient);
      console.log('- Body:', body);
      
      geminiResponse = {
        reply: `Sending email to ${recipient}...`,
        toolCalls: [{
          tool: 'GMAIL_SEND_EMAIL',
          arguments: {
            recipient_email: recipient,
            subject: 'Hello',
            body: body
          }
        }]
      };
    } else if (listUnreadMatch) {
      console.log('Parsed list unread emails command');
      
      geminiResponse = {
        reply: 'Fetching your unread emails...',
        toolCalls: [{
          tool: 'GMAIL_FETCH_EMAILS',
          arguments: {
            max_results: 10,
            query: 'is:unread'
          }
        }]
      };
    } else if (listInboxMatch) {
      console.log('Parsed list inbox emails command');
      
      geminiResponse = {
        reply: 'Fetching your inbox messages...',
        toolCalls: [{
          tool: 'GMAIL_FETCH_EMAILS',
          arguments: {
            max_results: 10,
            query: ''
          }
        }]
      };
    } else if (replyMatch) {
      const replyBody = replyMatch[1] || replyMatch[2] || replyMatch[3];
      console.log('Parsed reply command:');
      console.log('- Reply body:', replyBody);
      
      geminiResponse = {
        reply: 'Finding last email to reply to...',
        toolCalls: [{
          tool: 'GMAIL_FETCH_EMAILS',
          arguments: {
            max_results: 1,
            query: ''
          },
          replyBody: replyBody // Store reply body for later use
        }]
      };
    } else if (draftsMatch) {
      console.log('Parsed list drafts command');
      
      geminiResponse = {
        reply: 'Fetching your draft messages...',
        toolCalls: [{
          tool: 'GMAIL_LIST_DRAFTS',
          arguments: {
            max_results: 10
          }
        }]
      };
    } else if (deleteMatch) {
      const sourceFilter = deleteMatch[1] || deleteMatch[2] || '';
      console.log('Parsed delete email command');
      console.log('- Source filter:', sourceFilter);
      
      // Determine the query based on the source filter
      let query = '';
      if (sourceFilter && sourceFilter.trim()) {
        if (sourceFilter.toLowerCase().includes('spam')) {
          query = 'in:spam';
        } else if (sourceFilter.toLowerCase().includes('trash')) {
          query = 'in:trash';
        } else if (sourceFilter.toLowerCase().includes('sent')) {
          query = 'in:sent';
        } else {
          // Assume it's a sender filter
          query = `from:${sourceFilter.trim()}`;
        }
      }
      // If no source filter, query remains empty to get latest from inbox
      
      geminiResponse = {
        reply: 'Finding email to remove from inbox...',
        toolCalls: [{
          tool: 'GMAIL_FETCH_EMAILS',
          arguments: {
            max_results: 1,
            query: query
          },
          deleteAction: true // Flag to indicate this is for deletion
        }]
      };
    } else if (listLabelsMatch) {
      console.log('Parsed list labels command');
      
      geminiResponse = {
        reply: 'Fetching your Gmail labels...',
        toolCalls: [{
          tool: 'GMAIL_LIST_LABELS',
          arguments: {}
        }]
      };
    } else if (addLabelMatch) {
      const labelName = addLabelMatch[1] || addLabelMatch[2] || '';
      console.log('Parsed add label command');
      console.log('- Label to add:', labelName);
      
      geminiResponse = {
        reply: 'Finding email to add label to...',
        toolCalls: [{
          tool: 'GMAIL_FETCH_EMAILS',
          arguments: {
            max_results: 1,
            query: ''
          },
          addLabelAction: true,
          labelName: labelName
        }]
      };
    } else if (removeLabelMatch) {
      const labelName = removeLabelMatch[1] || removeLabelMatch[2] || '';
      console.log('Parsed remove label command');
      console.log('- Label to remove:', labelName);
      
      geminiResponse = {
        reply: 'Finding email to remove label from...',
        toolCalls: [{
          tool: 'GMAIL_FETCH_EMAILS',
          arguments: {
            max_results: 1,
            query: ''
          },
          removeLabelAction: true,
          labelName: labelName
        }]
      };
    } else if (searchMatch) {
      const searchQuery = searchMatch[1] || searchMatch[2] || searchMatch[3] || '';
      console.log('Parsed search emails command');
      console.log('- Search query:', searchQuery);
      
      geminiResponse = {
        reply: `Searching emails for: "${searchQuery}"...`,
        toolCalls: [{
          tool: 'GMAIL_FETCH_EMAILS',
          arguments: {
            max_results: 5,
            query: searchQuery
          }
        }]
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

        // If this is a reply command, we need to execute a second tool call
        if (toolCall.replyBody && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          console.log('Processing reply - fetching thread_id from latest message');
          
          const messagesData = toolResult.data?.messages || toolResult.data || [];
          const messages = Array.isArray(messagesData) ? messagesData : [];
          
          if (messages.length > 0) {
            const latestMessage = messages[0];
            const threadId = latestMessage.threadId;
            console.log('Found thread ID for reply:', threadId);
            
            if (threadId) {
              console.log('Executing GMAIL_SEND_EMAIL as reply with thread_id:', threadId);
              
              // Extract email address from sender field (e.g., "Name <email@domain.com>" -> "email@domain.com")
              const senderField = latestMessage.sender || latestMessage.from || '';
              const emailMatch = senderField.match(/<([^>]+)>/);
              const recipientEmail = emailMatch ? emailMatch[1] : senderField;
              
              console.log('Original sender:', senderField);
              console.log('Extracted email:', recipientEmail);
              
              const replyResult = await composio.tools.execute(
                'GMAIL_SEND_EMAIL',
                {
                  userId: userId,
                  arguments: {
                    recipient_email: recipientEmail,
                    subject: `Re: ${latestMessage.subject}`,
                    body: toolCall.replyBody,
                    thread_id: threadId
                  }
                }
              );
              
              console.log('Reply execution result:', replyResult);
              toolResult = replyResult; // Use reply result as final result
            } else {
              throw new Error('Could not find thread_id from latest message');
            }
          } else {
            throw new Error('No messages found to reply to');
          }
        }

        // If this is a delete command, we need to execute a second tool call
        if (toolCall.deleteAction && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          console.log('Processing delete - fetching gmailId from latest message');
          
          const messagesData = toolResult.data?.messages || toolResult.data || [];
          const messages = Array.isArray(messagesData) ? messagesData : [];
          
          if (messages.length > 0) {
            const messageToDelete = messages[0];
            const gmailId = messageToDelete.id || messageToDelete.gmailId || messageToDelete.messageId;
            console.log('Found message to delete with ID:', gmailId);
            
            if (gmailId) {
              console.log('Attempting to move email to trash with gmailId:', gmailId);
              
              // Try different possible approaches for moving email to trash
              let deleteResult;
              const possibleApproaches = [
                // Try direct trash tools first with different parameter names
                { tool: 'GMAIL_TRASH_EMAIL', args: { gmail_id: gmailId } },
                { tool: 'GMAIL_MOVE_TO_TRASH', args: { message_id: gmailId } },
                { tool: 'GMAIL_MOVE_TO_TRASH', args: { gmail_id: gmailId } },
                { tool: 'GMAIL_DELETE_MESSAGE', args: { message_id: gmailId } },
                { tool: 'GMAIL_DELETE_MESSAGE', args: { gmail_id: gmailId } },
                { tool: 'GMAIL_DELETE_EMAIL', args: { gmail_id: gmailId } },
                // Try label modification approach (add TRASH label)
                { tool: 'GMAIL_MODIFY_LABELS', args: { gmail_id: gmailId, add_labels: ['TRASH'] } },
                { tool: 'GMAIL_MODIFY_LABELS', args: { message_id: gmailId, add_labels: ['TRASH'] } },
                { tool: 'GMAIL_ADD_LABELS', args: { gmail_id: gmailId, labels: ['TRASH'] } },
                { tool: 'GMAIL_ADD_LABELS', args: { message_id: gmailId, labels: ['TRASH'] } },
                // Try archiving as fallback
                { tool: 'GMAIL_ARCHIVE_EMAIL', args: { gmail_id: gmailId } },
                { tool: 'GMAIL_ARCHIVE_EMAIL', args: { message_id: gmailId } },
                { tool: 'GMAIL_MODIFY_LABELS', args: { gmail_id: gmailId, remove_labels: ['INBOX'] } },
                { tool: 'GMAIL_MODIFY_LABELS', args: { message_id: gmailId, remove_labels: ['INBOX'] } }
              ];
              
              for (const approach of possibleApproaches) {
                try {
                  console.log(`Trying approach: ${approach.tool} with args:`, approach.args);
                  deleteResult = await composio.tools.execute(
                    approach.tool,
                    {
                      userId: userId,
                      arguments: approach.args
                    }
                  );
                  console.log(`Result from ${approach.tool}:`, deleteResult);
                  
                  // Check if the operation was successful
                  if (deleteResult && deleteResult.successful) {
                    console.log(`Success with approach: ${approach.tool}`);
                    break; // Exit loop on success
                  } else {
                    console.log(`Approach ${approach.tool} returned unsuccessful result:`, deleteResult?.error);
                    continue; // Try next approach
                  }
                } catch (toolError: any) {
                  console.log(`Approach ${approach.tool} failed:`, toolError.message);
                  if (toolError.name === 'ComposioToolNotFoundError') {
                    continue; // Try next approach
                  } else {
                    // Log the error but continue trying other approaches
                    console.log(`Non-404 error with ${approach.tool}:`, toolError.message);
                    continue;
                  }
                }
              }
              
              if (!deleteResult || !deleteResult.successful) {
                throw new Error(`No suitable delete/trash/archive tool worked. Last attempt error: ${deleteResult?.error || 'Unknown error'}`);
              }
              
              console.log('Delete execution result:', deleteResult);
              
              // Store sender info for final message
              const senderField = messageToDelete.sender || messageToDelete.from || 'Unknown Sender';
              const emailMatch = senderField.match(/<([^>]+)>/);
              const senderEmail = emailMatch ? emailMatch[1] : senderField;
              
              toolResult = {
                ...deleteResult,
                deletedFrom: senderEmail,
                deletedSubject: messageToDelete.subject || 'No Subject'
              };
            } else {
              throw new Error('Could not find gmailId from message');
            }
          } else {
            throw new Error('No messages found to delete');
          }
        }

        // If this is an add label command, we need to execute a second tool call
        if (toolCall.addLabelAction && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          console.log('Processing add label - fetching gmailId from latest message');
          
          const messagesData = toolResult.data?.messages || toolResult.data || [];
          const messages = Array.isArray(messagesData) ? messagesData : [];
          
          if (messages.length > 0) {
            const messageToLabel = messages[0];
            const gmailId = messageToLabel.id || messageToLabel.gmailId || messageToLabel.messageId;
            console.log('Found message to add label with ID:', gmailId);
            console.log('Label to add:', toolCall.labelName);
            
            if (gmailId && toolCall.labelName) {
              console.log('Executing GMAIL_ADD_LABEL_TO_EMAIL with label:', toolCall.labelName);
              
              // Try different approaches for adding labels using correct Composio tools
              let labelResult;
              const labelApproaches = [
                // Use the correct GMAIL_ADD_LABEL_TO_EMAIL tool with proper parameters
                { tool: 'GMAIL_ADD_LABEL_TO_EMAIL', args: { message_id: gmailId, add_label_ids: [toolCall.labelName.toUpperCase()] } },
                { tool: 'GMAIL_ADD_LABEL_TO_EMAIL', args: { message_id: gmailId, add_label_ids: [toolCall.labelName.toLowerCase()] } },
                { tool: 'GMAIL_ADD_LABEL_TO_EMAIL', args: { message_id: gmailId, add_label_ids: [toolCall.labelName] } },
                // Try with legacy parameter names as fallback
                { tool: 'GMAIL_ADD_LABEL_TO_EMAIL', args: { gmail_id: gmailId, add_label_ids: [toolCall.labelName.toUpperCase()] } },
                { tool: 'GMAIL_MODIFY_LABELS', args: { message_id: gmailId, add_labels: [toolCall.labelName.toUpperCase()] } },
                { tool: 'GMAIL_MODIFY_LABELS', args: { gmail_id: gmailId, add_labels: [toolCall.labelName.toUpperCase()] } }
              ];
              
              for (const approach of labelApproaches) {
                try {
                  console.log(`Trying label approach: ${approach.tool} with args:`, approach.args);
                  labelResult = await composio.tools.execute(
                    approach.tool,
                    {
                      userId: userId,
                      arguments: approach.args
                    }
                  );
                  console.log(`Label result from ${approach.tool}:`, labelResult);
                  
                  if (labelResult && labelResult.successful) {
                    console.log(`Success adding label with approach: ${approach.tool}`);
                    break;
                  } else {
                    console.log(`Approach ${approach.tool} unsuccessful:`, labelResult?.error);
                    continue;
                  }
                } catch (labelError: any) {
                  console.log(`Label approach ${approach.tool} failed:`, labelError.message);
                  if (labelError.name === 'ComposioToolNotFoundError') {
                    console.log(`Tool ${approach.tool} not found - trying next approach`);
                    continue;
                  } else {
                    console.log(`Non-404 error with ${approach.tool}: ${labelError.message}`);
                    continue;
                  }
                }
              }
              
              if (!labelResult || !labelResult.successful) {
                // Since Gmail label management tools are not available in Composio,
                // provide informative response about the limitation
                console.log('Gmail label management tools not available in current toolkit');
                
                // Create a "successful" result for user feedback
                const senderField = messageToLabel.sender || messageToLabel.from || 'Unknown Sender';
                const emailMatch = senderField.match(/<([^>]+)>/);
                const senderEmail = emailMatch ? emailMatch[1] : senderField;
                
                toolResult = {
                  successful: true,
                  data: {},
                  error: null,
                  labeledFrom: senderEmail,
                  labeledSubject: messageToLabel.subject || 'No Subject',
                  addedLabel: toolCall.labelName,
                  limitationMessage: true
                };
              }
              
              // Store info for final message
              const senderField = messageToLabel.sender || messageToLabel.from || 'Unknown Sender';
              const emailMatch = senderField.match(/<([^>]+)>/);
              const senderEmail = emailMatch ? emailMatch[1] : senderField;
              
              toolResult = {
                ...labelResult,
                labeledFrom: senderEmail,
                labeledSubject: messageToLabel.subject || 'No Subject',
                addedLabel: toolCall.labelName
              };
            } else {
              throw new Error('Could not find gmailId or label name for add label operation');
            }
          } else {
            throw new Error('No messages found to add label to');
          }
        }

        // If this is a remove label command, we need to execute a second tool call
        if (toolCall.removeLabelAction && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          console.log('Processing remove label - fetching gmailId from latest message');
          
          const messagesData = toolResult.data?.messages || toolResult.data || [];
          const messages = Array.isArray(messagesData) ? messagesData : [];
          
          if (messages.length > 0) {
            const messageToLabel = messages[0];
            const gmailId = messageToLabel.id || messageToLabel.gmailId || messageToLabel.messageId;
            console.log('Found message to remove label with ID:', gmailId);
            console.log('Label to remove:', toolCall.labelName);
            
            if (gmailId && toolCall.labelName) {
              console.log('Executing GMAIL_REMOVE_LABEL with label:', toolCall.labelName);
              
              // Try different approaches for removing labels using correct Composio tools
              let labelResult;
              const labelApproaches = [
                // Use the correct GMAIL_REMOVE_LABEL tool
                { tool: 'GMAIL_REMOVE_LABEL', args: { message_id: gmailId, label_id: toolCall.labelName.toUpperCase() } },
                { tool: 'GMAIL_REMOVE_LABEL', args: { message_id: gmailId, label_id: toolCall.labelName.toLowerCase() } },
                { tool: 'GMAIL_REMOVE_LABEL', args: { message_id: gmailId, label_id: toolCall.labelName } },
                // Use GMAIL_ADD_LABEL_TO_EMAIL with remove_label_ids parameter
                { tool: 'GMAIL_ADD_LABEL_TO_EMAIL', args: { message_id: gmailId, remove_label_ids: [toolCall.labelName.toUpperCase()] } },
                { tool: 'GMAIL_ADD_LABEL_TO_EMAIL', args: { message_id: gmailId, remove_label_ids: [toolCall.labelName.toLowerCase()] } },
                { tool: 'GMAIL_ADD_LABEL_TO_EMAIL', args: { message_id: gmailId, remove_label_ids: [toolCall.labelName] } }
              ];
              
              for (const approach of labelApproaches) {
                try {
                  console.log(`Trying label approach: ${approach.tool} with args:`, approach.args);
                  labelResult = await composio.tools.execute(
                    approach.tool,
                    {
                      userId: userId,
                      arguments: approach.args
                    }
                  );
                  console.log(`Label result from ${approach.tool}:`, labelResult);
                  
                  if (labelResult && labelResult.successful) {
                    console.log(`Success removing label with approach: ${approach.tool}`);
                    break;
                  } else {
                    console.log(`Approach ${approach.tool} unsuccessful:`, labelResult?.error);
                    continue;
                  }
                } catch (labelError: any) {
                  console.log(`Label approach ${approach.tool} failed:`, labelError.message);
                  if (labelError.name === 'ComposioToolNotFoundError') {
                    console.log(`Tool ${approach.tool} not found - trying next approach`);
                    continue;
                  } else {
                    console.log(`Non-404 error with ${approach.tool}: ${labelError.message}`);
                    continue;
                  }
                }
              }
              
              if (!labelResult || !labelResult.successful) {
                // Since Gmail label management tools are not available in Composio,
                // provide informative response about the limitation
                console.log('Gmail label management tools not available in current toolkit');
                
                // Create a "successful" result for user feedback
                const senderField = messageToLabel.sender || messageToLabel.from || 'Unknown Sender';
                const emailMatch = senderField.match(/<([^>]+)>/);
                const senderEmail = emailMatch ? emailMatch[1] : senderField;
                
                toolResult = {
                  successful: true,
                  data: {},
                  error: null,
                  labeledFrom: senderEmail,
                  labeledSubject: messageToLabel.subject || 'No Subject',
                  removedLabel: toolCall.labelName,
                  limitationMessage: true
                };
              } else {
                // Store info for final message when successful
                const senderField = messageToLabel.sender || messageToLabel.from || 'Unknown Sender';
                const emailMatch = senderField.match(/<([^>]+)>/);
                const senderEmail = emailMatch ? emailMatch[1] : senderField;
                
                toolResult = {
                  ...labelResult,
                  labeledFrom: senderEmail,
                  labeledSubject: messageToLabel.subject || 'No Subject',
                  removedLabel: toolCall.labelName
                };
              }
            } else {
              throw new Error('Could not find gmailId or label name for remove label operation');
            }
          } else {
            throw new Error('No messages found to remove label from');
          }
        }
      } catch (toolError) {
        console.error('Error executing tools:', toolError);
        toolResult = { error: 'Failed to execute tools' };
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
        } else if (toolCall.tool === 'GMAIL_REPLY_EMAIL') {
          // Handle reply success
          finalReply = `✅ Replied to last email`;
        } else if (toolCall.replyBody && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          // Handle reply success (when we executed reply after fetching)
          finalReply = `✅ Replied to last email`;
        } else if (toolCall.deleteAction && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          // Handle delete/trash/archive success (when we executed action after fetching)
          const senderInfo = (toolResult as any).deletedFrom || 'Unknown Sender';
          finalReply = `🗑️ Email processed (moved to trash/archived) from ${senderInfo}`;
        } else if (toolCall.addLabelAction && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          // Handle add label success (when we executed add label after fetching)
          const senderInfo = (toolResult as any).labeledFrom || 'Unknown Sender';
          const labelName = (toolResult as any).addedLabel || 'Unknown Label';
          
          if ((toolResult as any).limitationMessage) {
            finalReply = `⚠️ Label management not available in current Gmail toolkit. However, I found the email from ${senderInfo} that would be marked as "${labelName}". You can manually add this label in Gmail.`;
          } else {
            finalReply = `🏷️ Added label "${labelName}" to email from ${senderInfo}`;
          }
        } else if (toolCall.removeLabelAction && toolCall.tool === 'GMAIL_FETCH_EMAILS') {
          // Handle remove label success (when we executed remove label after fetching)
          const senderInfo = (toolResult as any).labeledFrom || 'Unknown Sender';
          const labelName = (toolResult as any).removedLabel || 'Unknown Label';
          
          if ((toolResult as any).limitationMessage) {
            finalReply = `⚠️ Label management not available in current Gmail toolkit. However, I found the email from ${senderInfo} that would have label "${labelName}" removed. You can manually remove this label in Gmail.`;
          } else {
            finalReply = `🏷️ Removed label "${labelName}" from email from ${senderInfo}`;
          }
        } else if (toolCall.tool === 'GMAIL_LIST_LABELS') {
          // Handle labels listing success - Return list of available labels
          const labelsData = (toolResult.data as any)?.labels || toolResult.data || [];
          const labels = Array.isArray(labelsData) ? labelsData : [];
          console.log('Retrieved labels count:', labels.length);
          console.log('First label sample:', labels[0]);
          
          if (labels.length === 0) {
            finalReply = `🏷️ No labels found`;
          } else {
            let labelsList = `🏷️ Found ${labels.length} labels:\n\n`;
            
            labels.forEach((label: any, index: number) => {
              console.log(`Processing label ${index + 1}:`, Object.keys(label));
              const labelId = label.id || label.labelId || 'Unknown ID';
              const labelName = label.name || label.labelName || 'Unknown Label';
              const labelType = label.type || 'user';
              const messageCount = label.messagesTotal || label.messageCount || 'Unknown';
              
              labelsList += `${index + 1}. **${labelName}**\n`;
              labelsList += `   **ID:** ${labelId}\n`;
              labelsList += `   **Type:** ${labelType}\n`;
              labelsList += `   **Messages:** ${messageCount}\n\n`;
            });
            
            console.log('Final labels list reply:', labelsList);
            finalReply = labelsList;
          }
        } else if (toolCall.tool === 'GMAIL_LIST_DRAFTS') {
          // Handle drafts listing success - Return list of draft subjects with draftId
          const draftsData = (toolResult.data as any)?.drafts || toolResult.data || [];
          const drafts = Array.isArray(draftsData) ? draftsData : [];
          console.log('Retrieved drafts count:', drafts.length);
          console.log('First draft sample:', drafts[0]);
          
          if (drafts.length === 0) {
            finalReply = `📝 No draft messages found`;
          } else {
            let draftsList = `📝 Found ${drafts.length} draft messages:\n\n`;
            
            drafts.forEach((draft: any, index: number) => {
              console.log(`Processing draft ${index + 1}:`, Object.keys(draft));
              const draftId = draft.id || draft.draftId || draft.messageId || 'Unknown ID';
              const subject = draft.subject || draft.message?.subject || 'No Subject';
              const snippet = draft.snippet || draft.message?.snippet || draft.body || draft.message?.body || 'No preview';
              const date = draft.date || draft.message?.date || draft.created || 'Unknown Date';
              
              // Clean up the snippet
              const cleanSnippet = snippet.substring(0, 80).replace(/\r?\n/g, ' ').trim();
              
              draftsList += `${index + 1}. **Subject:** ${subject}\n`;
              draftsList += `   **Draft ID:** ${draftId}\n`;
              draftsList += `   **Preview:** ${cleanSnippet}...\n`;
              draftsList += `   **Date:** ${date}\n\n`;
            });
            
            console.log('Final drafts list reply:', draftsList);
            finalReply = draftsList;
          }
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
              finalReply = `� No emails found matching "${toolCall.arguments.query}"`;
            } else {
              finalReply = `�📭 No ${queryType} messages found`;
            }
          } else {
            let emailList;
            if (isSearchQuery) {
              emailList = `� Found ${messages.length} emails matching "${toolCall.arguments.query}":\n\n`;
            } else {
              emailList = `�📧 Found ${messages.length} ${queryType} messages:\n\n`;
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
        finalReply = `❌ Failed to execute command: ${toolResult.error || 'Unknown error'}`;
      }
    }

    return res.json({
      reply: finalReply,
      toolResult: toolResult
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;