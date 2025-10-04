import { createClient } from '@supabase/supabase-js';

// Use service_role key only on the server, never expose to frontend.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Function to get the Supabase client instance
export const getSupabase = () => {
  return supabase;
};

export default supabase;