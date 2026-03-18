-- Migration: Explorer → Plus, Researcher → Pro
-- Drop existing CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_plan_type;

-- Migrate existing user data
UPDATE public.profiles SET plan = 'Plus' WHERE plan = 'Explorer';
UPDATE public.profiles SET plan = 'Pro'  WHERE plan = 'Researcher';

-- Add new CHECK constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT valid_plan_type CHECK (plan IN ('Free', 'Plus', 'Pro'));
