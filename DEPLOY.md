# Cloudflare Pages Deployment Guide

Your CookMate app is already configured for Cloudflare deployment via NuxtHub!

## Quick Deploy (Recommended)

### Option 1: Using NuxtHub CLI
```bash
npm run deploy
```
This will deploy directly to Cloudflare using NuxtHub.

### Option 2: Via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository: `nikisiagit/cookmate`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.output/public`
   - **Root directory**: `/` (leave default)
5. Click **Save and Deploy**

## Environment Variables

If you need to set environment variables:
1. Go to your project in Cloudflare Pages
2. Navigate to **Settings** → **Environment variables**
3. Add your variables (e.g., API keys, database URLs)

## Database & Storage

Your NuxtHub configuration already includes:
- ✅ Database (Cloudflare D1)
- ✅ Blob Storage (Cloudflare R2)

These will be automatically provisioned on Cloudflare.

## Benefits
- ✅ Unlimited bandwidth (free tier)
- ✅ 500 builds/month
- ✅ Global CDN
- ✅ No code changes needed
- ✅ Database and storage included
