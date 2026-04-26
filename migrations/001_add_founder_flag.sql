-- Founder Flag Migration
-- Run this in the Neon SQL Editor (https://console.neon.tech)

-- 1. Add founder column (defaults to false for all existing members)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS founder BOOLEAN NOT NULL DEFAULT false;

-- 2. Set founder for masterde
UPDATE public.members SET founder = true WHERE github_username = 'masterde';

-- Verify
SELECT id, display_name, github_username, role, founder
FROM public.members
WHERE role = 'core' OR founder = true;
