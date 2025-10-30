@echo off
echo Deploying update_issue_status Edge Function...

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Supabase CLI is not installed.
    echo Please install it with: npm install -g supabase
    pause
    exit /b 1
)

REM Deploy the function
supabase functions deploy update_issue_status

REM Check if deployment was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Edge Function deployed successfully!
    echo Listing deployed functions:
    supabase functions list
) else (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

pause
