-- Run this SQL in Supabase SQL editor or via supabase cli
-- Migration: Create onboardings table for storing user onboarding preferences

CREATE TABLE IF NOT EXISTS public.onboardings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  purpose text NOT NULL,
  profession text NOT NULL,
  integrations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS onboardings_user_id_idx ON public.onboardings (user_id);

-- Optional: Add RLS (Row Level Security) policies if needed
-- ALTER TABLE public.onboardings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only access their own onboarding data" ON public.onboardings
--   FOR ALL USING (auth.uid()::text = user_id);