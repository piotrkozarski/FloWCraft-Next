# Deployment Guide

## Vercel Deployment Steps

### 1. Environment Variables Setup

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

### 2. Supabase OAuth Configuration

In Supabase Dashboard → Authentication → Providers:

1. **Enable GitHub Provider**:
   - Create GitHub OAuth app in GitHub Developer Settings
   - Add Client ID and Client Secret to Supabase
   - Set Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`

2. **Enable Google Provider**:
   - Create Google OAuth app in Google Cloud Console
   - Add Client ID and Client Secret to Supabase
   - Set Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

3. **Configure Site URLs**:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app`
   - For local development: `http://localhost:5173`

### 3. Deploy

1. Push to main branch or click "Deploy" in Vercel
2. Vercel will automatically build and deploy
3. Your app will be live at `https://your-project.vercel.app`

## Local Development

1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials
3. Run `npm run dev`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

**Note**: Vite only exposes environment variables prefixed with `VITE_`
