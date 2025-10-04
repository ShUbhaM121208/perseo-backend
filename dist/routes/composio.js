import { Router } from 'express';
import composio from '../composio/client';
import { supabase } from '../db/supabaseClient';
const router = Router();
/**
 * GET /gmail/connect
 * Initiate Gmail OAuth connection via Composio
 */
router.get('/gmail/connect', async (req, res) => {
    try {
        const { user_id } = req.query;
        // Validate user_id parameter
        if (!user_id || typeof user_id !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Missing or invalid user_id parameter'
            });
            return;
        }
        // Validate environment variables
        if (!process.env.COMPOSIO_API_KEY) {
            console.error('Missing COMPOSIO_API_KEY environment variable');
            res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
            return;
        }
        if (!process.env.COMPOSIO_GMAIL_AUTH_CONFIG_ID) {
            console.error('Missing COMPOSIO_GMAIL_AUTH_CONFIG_ID environment variable');
            res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
            return;
        }
        console.log(`🔗 Initiating Gmail connection for user: ${user_id}`);
        // Call composio.connected_accounts.initiate as per your specifications
        const connectionResponse = await composio.connectedAccounts.initiate(user_id, process.env.COMPOSIO_GMAIL_AUTH_CONFIG_ID);
        console.log('📧 Gmail OAuth URL generated:', connectionResponse.redirectUrl);
        // Return JSON with OAuth redirect URL
        res.status(200).json({
            success: true,
            url: connectionResponse.redirectUrl
        });
    }
    catch (error) {
        console.error('Composio Gmail connection error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate Gmail connection'
        });
    }
});
/**
 * GET /gmail/callback
 * Handle Gmail OAuth callback and update user onboarding status
 */
router.get('/gmail/callback', async (req, res) => {
    try {
        const { connection_id, user_id } = req.query;
        // Validate required parameters
        if (!connection_id || typeof connection_id !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Missing or invalid connection_id parameter'
            });
            return;
        }
        if (!user_id || typeof user_id !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Missing or invalid user_id parameter'
            });
            return;
        }
        console.log(`📧 Processing Gmail callback for user: ${user_id}, connection: ${connection_id}`);
        // Use composio.connected_accounts.get(connection_id)
        const connectionData = await composio.connectedAccounts.get(connection_id);
        console.log('✅ Gmail connection verified:', connectionData.id);
        // Update Supabase table user_onboarding SET gmail_connected=true
        const { data, error } = await supabase
            .from('user_onboarding')
            .update({
            gmail_connected: true,
            updated_at: new Date().toISOString()
        })
            .eq('user_id', user_id);
        if (error) {
            console.error('Error updating user onboarding:', error);
            // Still redirect to frontend with error parameter
            const redirectUrl = `${process.env.FRONTEND_URL}/onboarding?error=database`;
            res.redirect(redirectUrl);
            return;
        }
        console.log('✅ User onboarding updated successfully');
        // Redirect to frontend with success parameter
        const redirectUrl = `${process.env.FRONTEND_URL}/onboarding?success=gmail`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Composio Gmail callback error:', error);
        // Redirect to frontend with error parameter
        const redirectUrl = `${process.env.FRONTEND_URL}/onboarding?error=callback`;
        res.redirect(redirectUrl);
    }
});
export default router;
//# sourceMappingURL=composio.js.map