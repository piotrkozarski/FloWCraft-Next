#!/bin/bash

# Deploy Supabase Edge Function for update_issue_status
echo "Deploying update_issue_status Edge Function..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Deploy the function
supabase functions deploy update_issue_status

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo "Listing deployed functions:"
    supabase functions list
else
    echo "❌ Deployment failed!"
    exit 1
fi
