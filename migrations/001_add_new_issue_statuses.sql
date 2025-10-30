-- Migration: Add new issue statuses
-- Description: Add READY_FOR_REVIEW and READY_TO_TEST statuses to the issue_status enum

-- Add new values to the issue_status enum
ALTER TYPE issue_status ADD VALUE IF NOT EXISTS 'READY_FOR_REVIEW';
ALTER TYPE issue_status ADD VALUE IF NOT EXISTS 'READY_TO_TEST';

-- Update any existing CHECK constraints if they exist
-- (This is a fallback in case the status column uses CHECK instead of enum)
DO $$
BEGIN
    -- Check if there's a CHECK constraint on the status column
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%status%' 
        AND table_name = 'issues'
    ) THEN
        -- Drop existing constraint and recreate with new values
        ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;
        ALTER TABLE issues ADD CONSTRAINT issues_status_check 
        CHECK (status IN ('Todo', 'In Progress', 'Ready For Review', 'In Review', 'Ready To Test', 'Done'));
    END IF;
END $$;

-- Update RLS policies to allow the new status values
-- (This assumes there are existing policies that need to be updated)
-- The policies should already work since they typically check for user permissions, not specific status values

-- Add a comment to document the change
COMMENT ON TYPE issue_status IS 'Issue status enum: Todo, In Progress, Ready For Review, In Review, Ready To Test, Done';
