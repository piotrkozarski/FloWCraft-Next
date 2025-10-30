@echo off
echo Testing CORS preflight for update_issue_status Edge Function...

REM Get the Supabase URL from environment or use default
if defined VITE_SUPABASE_URL (
    set SUPABASE_URL=%VITE_SUPABASE_URL%
) else (
    set SUPABASE_URL=https://wobgbdmqcndsmlrfvrbj.supabase.co
)
set FUNCTION_URL=%SUPABASE_URL%/functions/v1/update_issue_status

echo Testing OPTIONS request to: %FUNCTION_URL%
echo Origin: https://flo-w-craft-next.vercel.app
echo.

REM Test OPTIONS request
curl -i -X OPTIONS ^
  -H "Origin: https://flo-w-craft-next.vercel.app" ^
  -H "Access-Control-Request-Method: POST" ^
  -H "Access-Control-Request-Headers: authorization,content-type" ^
  "%FUNCTION_URL%"

echo.
echo.

REM Test HEAD request
echo Testing HEAD request...
curl -i -X HEAD ^
  -H "Origin: https://flo-w-craft-next.vercel.app" ^
  "%FUNCTION_URL%"

echo.
echo CORS test completed!
pause
