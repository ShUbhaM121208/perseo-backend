import { Router, Request, Response } from 'express';
import { requireSupabaseAuth } from '../middleware/supabaseAuth';
import { saveOnboarding, getOnboarding, OnboardingData } from '../services/onboardingService';

const router = Router();

/**
 * POST /api/onboarding
 * Save or update user's onboarding preferences
 */
router.post('/api/onboarding', requireSupabaseAuth, async (req: Request, res: Response) => {
  try {
    const { purpose, profession, integrations }: OnboardingData = req.body;

    // Validate required fields
    if (!purpose || !profession || !Array.isArray(integrations)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: purpose, profession, integrations'
      });
    }

    const userId = req.user!.id;
    const result = await saveOnboarding(userId, { purpose, profession, integrations });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to save onboarding data'
      });
    }

    return res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error in POST /api/onboarding:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/onboarding
 * Fetch user's onboarding preferences
 */
router.get('/api/onboarding', requireSupabaseAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await getOnboarding(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch onboarding data'
      });
    }

    return res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error in GET /api/onboarding:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;