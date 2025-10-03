import express from 'express';
import composio from '../composio/client.js';
import { getGmailTools, executeGmailTool } from '../services/composioService.js';
const router = express.Router();
// POST /gmail/connect: initiates OAuth flow via Composio and returns redirect_url
router.post('/connect', async (req, res) => {
    try {
        const { userId, userEmail } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        // Use userEmail as entity ID if provided, otherwise fall back to userId
        // This ensures consistency with tool execution
        const entityId = userEmail || userId;
        console.log('Creating connection with entity ID:', entityId);
        // Initialize connection request using the correct Composio API
        const connectionRequest = await composio.toolkits.authorize(entityId, 'gmail');
        return res.json({
            redirect_url: connectionRequest.redirectUrl,
            connectionRequest: connectionRequest,
            entityId: entityId, // Return the entity ID used
        });
    }
    catch (error) {
        console.error('Gmail connect error:', error);
        return res.status(500).json({ error: 'Failed to initiate Gmail connection' });
    }
});
// POST /gmail/disconnect: disconnects a Gmail account
router.post('/disconnect', async (req, res) => {
    try {
        const { connectedAccountId } = req.body;
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        // Disconnect the account
        try {
            await composio.connectedAccounts.delete(connectedAccountId);
            console.log('Disconnected Gmail account:', connectedAccountId);
            return res.json({
                success: true,
                message: 'Gmail account disconnected successfully'
            });
        }
        catch (deleteError) {
            // If the connection is already deleted (404), treat it as success
            if (deleteError.status === 404) {
                console.log('Gmail account was already disconnected:', connectedAccountId);
                return res.json({
                    success: true,
                    message: 'Gmail account was already disconnected'
                });
            }
            throw deleteError; // Re-throw other errors
        }
    }
    catch (error) {
        console.error('Gmail disconnect error:', error);
        return res.status(500).json({ error: 'Failed to disconnect Gmail account' });
    }
});
// GET /gmail/list-connections: lists all connected accounts for debugging
router.get('/list-connections', async (req, res) => {
    try {
        const connections = await composio.connectedAccounts.list();
        console.log('All connected accounts:', connections.items.map((conn) => ({
            id: conn.id,
            status: conn.status,
            toolkit: conn.toolkit?.slug
        })));
        return res.json({
            connections: connections.items,
            count: connections.items.length
        });
    }
    catch (error) {
        console.error('List connections error:', error);
        return res.status(500).json({ error: 'Failed to list connections' });
    }
});
// GET /gmail/connection-status: checks if a connection request has been completed
router.get('/connection-status', async (req, res) => {
    try {
        const { connectionId } = req.query;
        if (!connectionId) {
            return res.status(400).json({ error: 'connectionId is required' });
        }
        // Check if the connection is active
        try {
            const connections = await composio.connectedAccounts.list();
            const activeConnection = connections.items.find((conn) => conn.id === connectionId && conn.status === 'ACTIVE');
            if (activeConnection) {
                console.log('Active connection found:');
                console.log('Full connection object:', JSON.stringify(activeConnection, null, 2));
                console.log('Connection properties:', Object.keys(activeConnection));
            }
            return res.json({
                connected: !!activeConnection,
                connection: activeConnection || null
            });
        }
        catch (error) {
            // If we can't check the status, assume not connected yet
            return res.json({
                connected: false,
                connection: null
            });
        }
    }
    catch (error) {
        console.error('Connection status check error:', error);
        return res.status(500).json({ error: 'Failed to check connection status' });
    }
});
// GET /gmail/callback: handles redirect back from Gmail and finalizes connection
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        if (error) {
            // Redirect to frontend with error
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/email/callback?error=${error}`);
        }
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }
        // Handle the callback - in a production app, you might want to complete the OAuth flow here
        // For now, we'll just redirect to frontend with success
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/email/callback?code=${code}&state=${state || ''}`);
    }
    catch (error) {
        console.error('Gmail callback error:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/email/callback?error=callback_failed`);
    }
});
// POST /gmail/send: creates Gmail email draft using Composio
router.post('/send', async (req, res) => {
    try {
        const { connectedAccountId, to, subject, body, isHtml = false } = req.body;
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        if (!to || (!subject && !body)) {
            return res.status(400).json({
                error: 'to is required, and at least one of subject or body must be provided'
            });
        }
        // Get the connected account to extract entity ID
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        // Extract the correct entity ID from the connected account's JWT token
        let entityId;
        try {
            const connectionData = activeConnection.data;
            if (!connectionData || !connectionData.id_token) {
                throw new Error('Token data not found');
            }
            const idToken = connectionData.id_token;
            const tokenParts = idToken.split('.');
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            entityId = payload.email;
            if (!entityId) {
                throw new Error('Email not found in token');
            }
            console.log('*** Extracted Entity ID for sending email:', entityId, '***');
        }
        catch (error) {
            console.error('Failed to extract entity ID from JWT token:', error);
            return res.status(400).json({
                error: 'Could not determine entity ID for this connected account'
            });
        }
        console.log('Sending email with connected account:', connectedAccountId);
        // Use the same entity ID that was used to create the connection
        const connectionEntityId = 'shubhamm.0010@gmail.com'; // This should match what we used in connect
        console.log('Using connection entity ID for sending:', connectionEntityId);
        // Try different Gmail send tools
        console.log('Attempting to send email with connected account:', connectedAccountId);
        const possibleSendTools = [
            'GMAIL_SEND_EMAIL',
            'GMAIL_COMPOSE_EMAIL',
            'GMAIL_CREATE_DRAFT',
            'GMAIL_SEND_MESSAGE',
            'GMAIL_CREATE_EMAIL'
        ];
        let result;
        let successfulTool = '';
        for (const toolName of possibleSendTools) {
            try {
                console.log(`Trying send tool: ${toolName}`);
                result = await composio.tools.execute(toolName, {
                    userId: connectionEntityId,
                    arguments: {
                        recipient_email: to,
                        subject: subject,
                        body: body
                    }
                });
                successfulTool = toolName;
                console.log(`Success with send tool: ${toolName}`);
                break;
            }
            catch (toolError) {
                console.log(`Send tool ${toolName} failed:`, toolError.message);
                if (!toolError.message?.includes('not found')) {
                    console.log(`Send tool ${toolName} exists but failed with:`, toolError.message);
                }
            }
        }
        if (!result) {
            throw new Error('All Gmail send tools failed - check available tools via /api/gmail/tools');
        }
        console.log('Gmail draft created:', result);
        return res.json({
            success: true,
            message: 'Email draft created successfully',
            result: result
        });
    }
    catch (error) {
        console.error('Gmail send error:', error);
        return res.status(500).json({
            error: 'Failed to create email draft',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /gmail/draft: creates Gmail email draft using Composio
router.post('/draft', async (req, res) => {
    try {
        const { connectedAccountId, recipient_email, subject, body, is_html = false, attachments = [] } = req.body;
        // Validation
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        if (!recipient_email || (!Array.isArray(recipient_email) && typeof recipient_email !== 'string')) {
            return res.status(400).json({
                error: 'recipient_email is required and must be a string or array of strings'
            });
        }
        if (!body) {
            return res.status(400).json({
                error: 'body is required for draft creation'
            });
        }
        // Get the connected account to extract entity ID
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        // Extract the correct entity ID from the connected account's JWT token
        let entityId;
        try {
            const connectionData = activeConnection.data;
            if (!connectionData || !connectionData.id_token) {
                throw new Error('Token data not found');
            }
            const idToken = connectionData.id_token;
            const tokenParts = idToken.split('.');
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            entityId = payload.email;
            if (!entityId) {
                throw new Error('Email not found in token');
            }
            console.log('*** Extracted Entity ID for draft creation:', entityId, '***');
        }
        catch (error) {
            console.error('Failed to extract entity ID from JWT token:', error);
            return res.status(400).json({
                error: 'Could not determine entity ID for this connected account'
            });
        }
        console.log('Creating Gmail draft with connected account:', connectedAccountId);
        // Use the same entity ID that was used to create the connection
        const connectionEntityId = 'shubhamm.0010@gmail.com'; // This should match what we used in connect
        console.log('Using connection entity ID for draft:', connectionEntityId);
        // Prepare draft parameters
        const draftParams = {
            body: body,
            subject: subject || 'No Subject'
        };
        // Handle recipient_email as array or string
        if (Array.isArray(recipient_email)) {
            if (recipient_email.length > 0) {
                draftParams.recipient_email = recipient_email[0]; // Use first recipient for primary
                if (recipient_email.length > 1) {
                    draftParams.cc = recipient_email.slice(1); // Rest as CC
                }
            }
        }
        else {
            draftParams.recipient_email = recipient_email;
        }
        // Add optional parameters
        if (is_html) {
            draftParams.is_html = is_html;
        }
        if (attachments && attachments.length > 0) {
            draftParams.attachments = attachments;
        }
        // Use the verified working Gmail draft tool
        console.log('Creating Gmail draft with parameters:', draftParams);
        const result = await executeGmailTool('GMAIL_CREATE_DRAFT', connectionEntityId, draftParams);
        console.log('Draft created successfully with GMAIL_CREATE_DRAFT');
        console.log('Gmail draft created:', result);
        return res.json({
            success: true,
            message: 'Email draft created successfully',
            toolUsed: 'GMAIL_CREATE_DRAFT',
            draftId: result.result?.id || result.result?.draftId || 'unknown',
            result: result.result
        });
    }
    catch (error) {
        console.error('Gmail draft creation error:', error);
        return res.status(500).json({
            error: 'Failed to create email draft',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /gmail/send-draft - Send a draft email
router.post('/send-draft', async (req, res) => {
    try {
        const { connectedAccountId, draft_id } = req.body;
        // Validation
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        if (!draft_id) {
            return res.status(400).json({
                error: 'draft_id is required'
            });
        }
        // Get the connected account to extract entity ID
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        // Use the same entity ID that was used to create the connection
        const connectionEntityId = 'shubhamm.0010@gmail.com'; // This should match what we used in connect
        console.log('Using connection entity ID for sending draft:', connectionEntityId);
        // Prepare send draft parameters
        const sendDraftParams = {
            draft_id: draft_id
        };
        console.log('Attempting to send Gmail draft with parameters:', sendDraftParams);
        const result = await executeGmailTool('GMAIL_SEND_DRAFT', connectionEntityId, sendDraftParams);
        console.log('Gmail draft sent:', result);
        return res.json({
            success: true,
            message: 'Draft sent successfully',
            data: {
                message_id: result.result?.id || result.result?.messageId || 'unknown',
                status: result.result?.status || 'sent',
                result: result.result
            }
        });
    }
    catch (error) {
        console.error('Gmail send draft error:', error);
        return res.status(500).json({
            error: 'Failed to send draft',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /gmail/reply - Reply to a thread or message
router.post('/reply', async (req, res) => {
    try {
        const { connectedAccountId, thread_id, message_id, body, attachments = [] } = req.body;
        // Validation
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        if (!thread_id) {
            return res.status(400).json({
                error: 'thread_id is required'
            });
        }
        if (!body) {
            return res.status(400).json({
                error: 'body is required for reply'
            });
        }
        // Get the connected account to extract entity ID
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        // Use the same entity ID that was used to create the connection
        const connectionEntityId = 'shubhamm.0010@gmail.com'; // This should match what we used in connect
        console.log('Using connection entity ID for reply:', connectionEntityId);
        // Prepare reply parameters
        const replyParams = {
            thread_id: thread_id,
            body: body
        };
        // Add optional message_id if provided
        if (message_id) {
            replyParams.message_id = message_id;
        }
        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            replyParams.attachments = attachments;
        }
        console.log('Replying to Gmail thread with parameters:', replyParams);
        // Use the verified working Gmail reply tool
        const result = await executeGmailTool('GMAIL_REPLY_TO_EMAIL', connectionEntityId, replyParams);
        console.log('Reply sent successfully with GMAIL_REPLY_TO_EMAIL');
        console.log('Gmail reply sent:', result);
        return res.json({
            success: true,
            message: 'Reply sent successfully',
            toolUsed: 'GMAIL_REPLY_TO_EMAIL',
            data: {
                message_id: result.result?.id || result.result?.messageId || 'unknown',
                thread_id: thread_id,
                status: result.result?.status || 'sent',
                result: result.result
            }
        });
    }
    catch (error) {
        console.error('Gmail reply error:', error);
        return res.status(500).json({
            error: 'Failed to send reply',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /gmail/labels - Modify labels for a message
router.post('/labels', async (req, res) => {
    try {
        const { connectedAccountId, message_id, add_labels = [], remove_labels = [] } = req.body;
        // Validation
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        if (!message_id) {
            return res.status(400).json({
                error: 'message_id is required'
            });
        }
        // At least one label operation should be specified
        if ((!add_labels || add_labels.length === 0) && (!remove_labels || remove_labels.length === 0)) {
            return res.status(400).json({
                error: 'At least one of add_labels or remove_labels must be provided and non-empty'
            });
        }
        // Get the connected account to extract entity ID
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        // Use the same entity ID that was used to create the connection
        const connectionEntityId = 'shubhamm.0010@gmail.com'; // This should match what we used in connect
        console.log('Using connection entity ID for label modification:', connectionEntityId);
        // Prepare label modification parameters
        const labelParams = {
            message_id: message_id
        };
        // Add labels to add if provided
        if (add_labels && add_labels.length > 0) {
            labelParams.add_labels = add_labels;
        }
        // Add labels to remove if provided
        if (remove_labels && remove_labels.length > 0) {
            labelParams.remove_labels = remove_labels;
        }
        console.log('Modifying Gmail message labels with parameters:', labelParams);
        // Use the verified working Gmail labels tool
        const result = await executeGmailTool('GMAIL_MODIFY_LABELS', connectionEntityId, labelParams);
        console.log('Labels modified successfully with GMAIL_MODIFY_LABELS');
        console.log('Gmail message labels modified:', result);
        return res.json({
            success: true,
            message: 'Message labels modified successfully',
            toolUsed: 'GMAIL_MODIFY_LABELS',
            data: {
                message_id: message_id,
                updated_labels: result.result?.labels || result.result?.labelIds || [],
                add_labels: add_labels,
                remove_labels: remove_labels,
                result: result.result
            }
        });
    }
    catch (error) {
        console.error('Gmail label modification error:', error);
        return res.status(500).json({
            error: 'Failed to modify message labels',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /gmail/move - Move message to trash, spam, inbox, or archive
router.post('/move', async (req, res) => {
    try {
        const { connectedAccountId, message_id, destination } = req.body;
        // Validation
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        if (!message_id) {
            return res.status(400).json({
                error: 'message_id is required'
            });
        }
        if (!destination) {
            return res.status(400).json({
                error: 'destination is required'
            });
        }
        // Validate destination values
        const validDestinations = ['TRASH', 'SPAM', 'INBOX', 'ARCHIVE'];
        if (!validDestinations.includes(destination)) {
            return res.status(400).json({
                error: 'Invalid destination. Must be one of: TRASH, SPAM, INBOX, ARCHIVE',
                validDestinations: validDestinations
            });
        }
        // Get the connected account to extract entity ID
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        // Use the same entity ID that was used to create the connection
        const connectionEntityId = 'shubhamm.0010@gmail.com'; // This should match what we used in connect
        console.log('Using connection entity ID for moving message:', connectionEntityId);
        // Prepare move parameters
        const moveParams = {
            message_id: message_id,
            destination: destination
        };
        console.log('Moving Gmail message with parameters:', moveParams);
        // Use the verified working Gmail move tool
        const result = await executeGmailTool('GMAIL_MOVE_EMAIL', connectionEntityId, moveParams);
        console.log('Message moved successfully with GMAIL_MOVE_EMAIL');
        console.log('Gmail message moved:', result);
        return res.json({
            success: true,
            message: `Message moved to ${destination} successfully`,
            toolUsed: 'GMAIL_MOVE_EMAIL',
            data: {
                message_id: message_id,
                destination: destination,
                status: result.result?.status || 'moved',
                result: result.result
            }
        });
    }
    catch (error) {
        console.error('Gmail move message error:', error);
        return res.status(500).json({
            error: 'Failed to move message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /gmail/message/:messageId - Get full message content by ID
router.get('/message/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { connectedAccountId, format = 'full' } = req.query;
        // Validation
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId query parameter is required' });
        }
        if (!messageId) {
            return res.status(400).json({
                error: 'messageId parameter is required'
            });
        }
        // Validate format parameter
        const validFormats = ['full', 'plain'];
        if (format && !validFormats.includes(format)) {
            return res.status(400).json({
                error: 'Invalid format. Must be one of: full, plain',
                validFormats: validFormats
            });
        }
        // Get the connected account to extract entity ID
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        // Use the same entity ID that was used to create the connection
        const connectionEntityId = 'shubhamm.0010@gmail.com'; // This should match what we used in connect
        console.log('Using connection entity ID for getting message:', connectionEntityId);
        // Prepare message retrieval parameters
        const messageParams = {
            message_id: messageId
        };
        // Add format parameter if specified
        if (format) {
            messageParams.format = format;
        }
        console.log('Getting Gmail message with parameters:', messageParams);
        // Use the verified working Gmail message retrieval tool
        const result = await executeGmailTool('GMAIL_GET_MESSAGE', connectionEntityId, messageParams);
        console.log('Message retrieved successfully with GMAIL_GET_MESSAGE');
        console.log('Gmail message retrieved:', result);
        // Extract message data from result
        const messageData = result.result || result;
        // Safely extract message properties with proper type handling
        const extractedData = messageData;
        return res.json({
            success: true,
            message: 'Message retrieved successfully',
            toolUsed: 'GMAIL_GET_MESSAGE',
            data: {
                message_id: messageId,
                format: format,
                headers: extractedData.headers || extractedData.payload?.headers || [],
                body: extractedData.body || extractedData.payload?.body || extractedData.snippet || '',
                attachments: extractedData.attachments || extractedData.payload?.parts?.filter((part) => part.filename) || [],
                labels: extractedData.labelIds || extractedData.labels || [],
                thread_id: extractedData.threadId || extractedData.thread_id || '',
                snippet: extractedData.snippet || '',
                internal_date: extractedData.internalDate || extractedData.internal_date || '',
                size_estimate: extractedData.sizeEstimate || extractedData.size_estimate || 0,
                full_message: messageData
            }
        });
    }
    catch (error) {
        console.error('Gmail get message error:', error);
        return res.status(500).json({
            error: 'Failed to retrieve message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /gmail/tools: lists all available Gmail tools for debugging
router.get('/tools', async (req, res) => {
    try {
        const entityId = 'shubhamm.001@gmail.com'; // Use same entity ID as connection
        const tools = await composio.tools.get(entityId, { toolkits: ['GMAIL'] });
        console.log('=== Available Gmail Tools ===');
        console.log(`Found ${tools.length} Gmail tools:`);
        tools.forEach((tool, index) => {
            console.log(`${index + 1}. ${tool.name || tool.slug}`);
            console.log(`   Slug: ${tool.slug}`);
            console.log(`   Description: ${tool.description || 'No description'}`);
            // Log possible variants for common operations
            if (tool.slug?.toLowerCase().includes('message') || tool.slug?.toLowerCase().includes('email')) {
                console.log(`   *** This might be for sending/getting emails ***`);
            }
            console.log('---');
        });
        // Also try to find specific patterns
        const sendTools = tools.filter((tool) => tool.slug?.toLowerCase().includes('send') ||
            tool.slug?.toLowerCase().includes('compose') ||
            tool.slug?.toLowerCase().includes('draft'));
        const getTools = tools.filter((tool) => tool.slug?.toLowerCase().includes('get') ||
            tool.slug?.toLowerCase().includes('list') ||
            tool.slug?.toLowerCase().includes('fetch') ||
            tool.slug?.toLowerCase().includes('read'));
        console.log('\n=== SEND/COMPOSE Tools ===');
        sendTools.forEach((tool) => console.log(`- ${tool.slug}`));
        console.log('\n=== GET/LIST Tools ===');
        getTools.forEach((tool) => console.log(`- ${tool.slug}`));
        return res.json({
            success: true,
            totalTools: tools.length,
            sendTools: sendTools.map((t) => t.slug),
            getTools: getTools.map((t) => t.slug),
            allTools: tools.map((tool) => ({
                name: tool.name || 'No name',
                slug: tool.slug || 'No slug',
                displayName: tool.displayName || 'No displayName',
                description: tool.description || 'No description'
            }))
        });
    }
    catch (error) {
        console.error('Gmail tools error:', error);
        return res.status(500).json({
            error: 'Failed to fetch Gmail tools',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /gmail/messages: fetches latest Gmail messages
router.get('/messages', async (req, res) => {
    try {
        const { connectedAccountId, entityId: providedEntityId } = req.query;
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        console.log('Fetching Gmail messages for connected account:', connectedAccountId);
        // Verify the connected account exists
        const connections = await composio.connectedAccounts.list();
        const activeConnection = connections.items.find((conn) => conn.id === connectedAccountId && conn.status === 'ACTIVE');
        if (!activeConnection) {
            return res.status(400).json({ error: 'Connected account not found or not active' });
        }
        console.log('Found active connection for account:', connectedAccountId);
        // Extract the correct entity ID from the connected account's JWT token
        let entityId;
        try {
            const connectionData = activeConnection.data;
            if (!connectionData || !connectionData.id_token) {
                throw new Error('Token data not found');
            }
            const idToken = connectionData.id_token;
            const tokenParts = idToken.split('.');
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            entityId = payload.email;
            if (!entityId) {
                throw new Error('Email not found in token');
            }
            console.log('*** Extracted Entity ID from connected account JWT:', entityId, '***');
        }
        catch (error) {
            console.error('Failed to extract entity ID from JWT token:', error);
            return res.status(400).json({
                error: 'Could not determine entity ID for this connected account'
            });
        }
        console.log('Executing GMAIL_FETCH_EMAILS with:');
        console.log('- Connected Account ID:', connectedAccountId);
        // Use a consistent entity ID for both connection creation and tool execution
        const connectionEntityId = 'shubhamm.0010@gmail.com';
        console.log('Using entity ID for tool execution:', connectionEntityId);
        // Try executing with the entity ID used to create the connection
        try {
            console.log('Attempting tool execution with entity ID:', entityId);
            // Try different tool names and format based on Composio docs
            const possibleToolNames = [
                'GMAIL_FETCH_EMAILS',
                'GMAIL_GET_MESSAGES',
                'GMAIL_LIST_MESSAGES',
                'GMAIL_READ_EMAILS',
                'GMAIL_GET_EMAILS'
            ];
            let result;
            let successfulTool = '';
            for (const toolName of possibleToolNames) {
                try {
                    console.log(`Trying tool: ${toolName} with entity ID: ${connectionEntityId}`);
                    // Use the correct Composio TypeScript format with named parameters
                    result = await composio.tools.execute(toolName, {
                        userId: connectionEntityId,
                        arguments: {
                            max_results: 50, // Increase from 10 to 50 emails
                            query: ''
                        }
                    });
                    successfulTool = toolName;
                    console.log(`Success with tool: ${toolName}`);
                    break;
                }
                catch (toolError) {
                    console.log(`Tool ${toolName} failed:`, toolError.message);
                    if (!toolError.message?.includes('not found')) {
                        // If it's not a "tool not found" error, it might be the entity ID issue
                        console.log(`Tool ${toolName} exists but failed with:`, toolError.message);
                    }
                }
            }
            if (!result) {
                throw new Error('All Gmail tools failed - check available tools via /api/gmail/tools');
            }
            console.log('Tool execution successful with entity ID!');
            console.log('Gmail messages result:', result);
            // Extract the actual messages array from the result
            const messagesData = result.data || result;
            const actualMessages = messagesData.messages || messagesData;
            return res.json({
                success: true,
                messages: actualMessages,
                nextPageToken: messagesData.nextPageToken,
                resultSizeEstimate: messagesData.resultSizeEstimate
            });
        }
        catch (entityError) {
            console.log('Entity-based execution failed, trying with connected account...');
            console.error('Entity error:', entityError);
            // Fallback: try with connected account ID
            try {
                const result = await composio.tools.execute('GMAIL_FETCH_EMAILS', {
                    connectedAccountId: connectedAccountId,
                    arguments: {
                        max_results: 10,
                        query: ''
                    }
                });
                console.log('Connected account execution successful!');
                console.log('Gmail messages result:', result);
                return res.json({
                    success: true,
                    messages: result.data || result
                });
            }
            catch (connectedAccountError) {
                console.error('Both methods failed');
                throw connectedAccountError;
            }
        }
    }
    catch (error) {
        console.error('Gmail messages error:', error);
        return res.status(500).json({
            error: 'Failed to fetch messages',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// POST /gmail/disconnect: Disconnect Gmail account
router.post('/disconnect', async (req, res) => {
    try {
        const { connectedAccountId } = req.body;
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        // Disconnect the account
        await composio.connectedAccounts.delete(connectedAccountId);
        console.log('Disconnected Gmail account:', connectedAccountId);
        return res.json({
            success: true,
            message: 'Gmail account disconnected successfully'
        });
    }
    catch (error) {
        console.error('Gmail disconnect error:', error);
        return res.status(500).json({
            error: 'Failed to disconnect Gmail account',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /gmail/debug-connection: Debug the existing connection details
router.get('/debug-connection', async (req, res) => {
    try {
        const { connectedAccountId } = req.query;
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        console.log('=== Debugging Connection & Entity Mapping ===');
        // List all connections to find our specific one
        const connections = await composio.connectedAccounts.list();
        const targetConnection = connections.items.find((conn) => conn.id === connectedAccountId);
        if (!targetConnection) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        console.log('Target connection details:', JSON.stringify(targetConnection, null, 2));
        // Extract the entity ID from the connection's JWT token
        try {
            const connectionData = targetConnection.data;
            if (connectionData && connectionData.id_token) {
                const idToken = connectionData.id_token;
                const tokenParts = idToken.split('.');
                const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                const extractedEntityId = payload.email;
                console.log('*** Extracted Entity ID from JWT:', extractedEntityId, '***');
                console.log('*** This should be the entity ID to use for tool execution ***');
            }
        }
        catch (e) {
            console.log('Could not extract entity ID from JWT token:', e);
        }
        return res.json({
            success: true,
            targetConnection: targetConnection,
            message: 'Check console logs for entity-connection mapping'
        });
    }
    catch (error) {
        console.error('Debug connection error:', error);
        return res.status(500).json({
            error: 'Failed to debug connection',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Debug endpoint to check entity relationships
router.get('/debug-entity', async (req, res) => {
    try {
        const { connectedAccountId } = req.query;
        if (!connectedAccountId) {
            return res.status(400).json({ error: 'connectedAccountId is required' });
        }
        // Get the connection details
        const connections = await composio.connectedAccounts.list();
        const connection = connections.items.find((conn) => conn.id === connectedAccountId);
        if (!connection) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        console.log('Connection details for debugging:', JSON.stringify(connection, null, 2));
        return res.json({
            connection: connection,
            connectionId: connectedAccountId,
            message: 'Check console logs for detailed connection information'
        });
    }
    catch (error) {
        console.error('Debug entity error:', error);
        return res.status(500).json({ error: 'Failed to debug entity information' });
    }
});
// GET /gmail/available-tools: fetches all available Gmail tools using composioService
router.get('/available-tools', async (req, res) => {
    try {
        const { userId } = req.query;
        // Use a default user ID if not provided
        const userIdToUse = userId || 'shubhamm.0010@gmail.com';
        console.log(`Fetching available Gmail tools for user: ${userIdToUse}`);
        // Use the composioService to get Gmail tools
        const toolsData = await getGmailTools(userIdToUse);
        console.log(`Successfully fetched ${toolsData.totalTools} Gmail tools`);
        return res.json({
            userId: userIdToUse,
            ...toolsData
        });
    }
    catch (error) {
        console.error('Error fetching available Gmail tools:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch available Gmail tools',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
//# sourceMappingURL=gmail.js.map