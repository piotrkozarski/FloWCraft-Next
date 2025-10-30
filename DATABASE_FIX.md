# Database Schema Fix for New Issue Statuses

## Problem
The application is trying to use new issue statuses (`'Ready For Review'` and `'Ready To Test'`) but the database schema only allows the original statuses (`'Todo'`, `'In Progress'`, `'In Review'`, `'Done'`).

## Error Details
- **CORS Error**: Edge Function returns 404 (not deployed)
- **Database Error**: 400 Bad Request due to CHECK constraint violation
- **Root Cause**: Database schema doesn't include new status values

## Solution

### 1. Update Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Fix database schema to include new issue statuses
ALTER TABLE public.issues DROP CONSTRAINT IF EXISTS issues_status_check;

ALTER TABLE public.issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('Todo', 'In Progress', 'Ready For Review', 'In Review', 'Ready To Test', 'Done'));
```

### 2. Deploy Edge Function (Optional)
If you want to use the Edge Function instead of direct Supabase calls:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wobgbdmqcndsmlrfvrbj

# Deploy the function
supabase functions deploy update_issue_status
```

### 3. Verify Fix
After updating the database schema:
1. Try dragging an issue to a new status
2. Check browser console for success messages
3. Verify the issue status persists after page reload

## Current Workaround
The application currently falls back to direct Supabase calls when the Edge Function fails, but this also fails due to the database constraint. The database schema fix above will resolve both issues.

## Files Modified
- `src/store.ts` - Enhanced error handling for constraint violations
- `fix-database-schema.sql` - SQL script to update database schema
- `supabase/functions/update_issue_status/index.ts` - Edge Function (ready to deploy)
