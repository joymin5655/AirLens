-- Migration to add plan column to profiles table

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'plan') THEN
        ALTER TABLE public.profiles ADD COLUMN plan text NOT NULL DEFAULT 'Free';
    END IF;
END $$;

-- Optional: Add a check constraint to ensure only valid plans are used
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_plan_type') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT valid_plan_type CHECK (plan IN ('Free', 'Explorer', 'Researcher'));
    END IF;
END $$;
