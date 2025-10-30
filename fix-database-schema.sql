-- Fix database schema to include new issue statuses
-- This updates the CHECK constraint to allow the new status values

-- First, drop the existing constraint
ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS issues_status_check;

-- Add the new constraint with all status values
ALTER TABLE public.issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('Todo', 'In Progress', 'Ready For Review', 'In Review', 'Ready To Test', 'Done'));

-- Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.issues'::regclass 
AND conname = 'issues_status_check';
