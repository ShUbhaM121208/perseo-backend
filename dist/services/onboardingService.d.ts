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
export declare const saveOnboarding: (userId: string, data: OnboardingData) => Promise<ServiceResponse<OnboardingRecord>>;
/**
 * Retrieves onboarding data for a user
 * @param userId - The user's unique identifier
 * @returns Promise with success status and onboarding data or null if not found
 */
export declare const getOnboarding: (userId: string) => Promise<ServiceResponse<OnboardingRecord | null>>;
