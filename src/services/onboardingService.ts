import { supabase } from '../db/supabaseClient';

export interface OnboardingData {
  purpose: string;
  profession: string;
  integrations: string[];
}

export interface OnboardingRecord extends OnboardingData {
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Saves or updates onboarding data for a user
 * @param userId - The user's unique identifier
 * @param data - Onboarding data containing purpose, profession, and integrations
 * @returns Promise with success status, data, or error
 */
export const saveOnboarding = async (
  userId: string,
  data: OnboardingData
): Promise<ServiceResponse<OnboardingRecord>> => {
  try {
    const onboardingRecord = {
      user_id: userId,
      purpose: data.purpose,
      profession: data.profession,
      integrations: data.integrations,
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('onboardings')
      .upsert(onboardingRecord, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving onboarding data:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Unexpected error saving onboarding:', error);
    return {
      success: false,
      error: 'Failed to save onboarding data'
    };
  }
};

/**
 * Retrieves onboarding data for a user
 * @param userId - The user's unique identifier
 * @returns Promise with success status and onboarding data or null if not found
 */
export const getOnboarding = async (
  userId: string
): Promise<ServiceResponse<OnboardingRecord | null>> => {
  try {
    const { data, error } = await supabase
      .from('onboardings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no record found, return null data with success = true
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: null
        };
      }

      console.error('Error fetching onboarding data:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Unexpected error fetching onboarding:', error);
    return {
      success: false,
      error: 'Failed to fetch onboarding data'
    };
  }
};