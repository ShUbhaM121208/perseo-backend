import { Router } from 'express';
import { requireSupabaseAuth } from '../middleware/supabaseAuth';
import { saveOnboarding, getOnboarding } from '../services/onboardingService';
import { supabase } from '../db/supabaseClient';
const router = Router();
/**
 * POST /save
 * Save complete onboarding data including Gmail connection status
 */
router.post('/save', requireSupabaseAuth, async (req, res) => {
    try {
        const { user_id, purpose, profession, gmail_connected } = req.body;
        // Validate required fields
        if (!purpose || !profession || typeof gmail_connected !== 'boolean') {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: purpose, profession, gmail_connected'
            });
            return;
        }
        // Use authenticated user's ID (ignore user_id from body for security)
        const userId = req.user.id;
        // Insert or update onboarding info in user_onboarding table
        const { data, error } = await supabase
            .from('user_onboarding')
            .upsert({
            user_id: userId,
            purpose,
            profession,
            gmail_connected,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })
            .select()
            .single();
        if (error) {
            console.error('Error saving onboarding data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to save onboarding data'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Onboarding data saved",
            data
        });
    }
    catch (error) {
        console.error('Onboarding save error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /
 * Save or update user's onboarding preferences
 */
router.post('/', requireSupabaseAuth, async (req, res) => {
    try {
        const { purpose, profession, integrations } = req.body;
        // Validate required fields
        if (!purpose || !profession || !Array.isArray(integrations)) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: purpose, profession, integrations'
            });
            return;
        }
        const userId = req.user.id;
        const result = await saveOnboarding(userId, { purpose, profession, integrations });
        if (!result.success) {
            res.status(500).json({
                success: false,
                error: result.error || 'Failed to save onboarding data'
            });
            return;
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('Error in POST /api/onboarding:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /
 * Fetch user's onboarding preferences
 */
router.get('/', requireSupabaseAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await getOnboarding(userId);
        if (!result.success) {
            res.status(500).json({
                success: false,
                error: result.error || 'Failed to fetch onboarding data'
            });
            return;
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('Error in GET onboarding:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
export default router;
//# sourceMappingURL=onboarding.js.map