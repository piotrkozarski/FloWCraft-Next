#!/bin/bash

# Test CORS preflight for update_issue_status Edge Function
echo "Testing CORS preflight for update_issue_status Edge Function..."

# Get the Supabase URL from environment or use default
SUPABASE_URL=${VITE_SUPABASE_URL:-"https://wobgbdmqcndsmlrfvrbj.supabase.co"}
FUNCTION_URL="${SUPABASE_URL}/functions/v1/update_issue_status"

echo "Testing OPTIONS request to: $FUNCTION_URL"
echo "Origin: https://flo-w-craft-next.vercel.app"
echo ""

# Test OPTIONS request
curl -i -X OPTIONS \
  -H "Origin: https://flo-w-craft-next.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  "$FUNCTION_URL"

echo ""
echo ""

# Test HEAD request
echo "Testing HEAD request..."
curl -i -X HEAD \
  -H "Origin: https://flo-w-craft-next.vercel.app" \
  "$FUNCTION_URL"

echo ""
echo "CORS test completed!"
