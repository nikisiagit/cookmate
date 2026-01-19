# NuxtHub Cloudflare Worker Deployment Guide

Your CookMate app is configured to deploy as a **Cloudflare Worker** using NuxtHub!

## What is NuxtHub?

NuxtHub is the official deployment platform for Nuxt apps on Cloudflare. When you deploy with NuxtHub, your app runs as a **Cloudflare Worker** with:
- **Edge runtime**: Your app runs on Cloudflare's global network
- **D1 Database**: Serverless SQL database automatically provisioned
- **R2 Blob Storage**: Object storage for images and files
- **Zero configuration**: Everything is set up automatically

## Deploy as Cloudflare Worker (Recommended)

### Step 1: Login to NuxtHub

First time only, authenticate with Cloudflare:
```bash
npx nuxthub login
```

This will open your browser and connect to your Cloudflare account.

### Step 2: Deploy

Deploy your app as a Cloudflare Worker:
```bash
npm run deploy
```

This command will:
1. Build your Nuxt app for Cloudflare Workers
2. Create/update your Worker on Cloudflare
3. Provision D1 database (if not exists)
4. Provision R2 storage (if not exists)
5. Deploy your code to the edge
6. Provide you with a live URL

### Step 3: Manage Your Deployment

Access your deployment dashboard at:
- **NuxtHub Admin**: [https://admin.hub.nuxt.com](https://admin.hub.nuxt.com)
- **Cloudflare Dashboard**: [https://dash.cloudflare.com](https://dash.cloudflare.com)

## Local Development with Workers

Test your app locally with Cloudflare Workers runtime:
```bash
npm run preview
```

This uses Wrangler to simulate the Cloudflare environment locally.

## Configuration Files

Your app is already configured:

### `nuxt.config.ts`
```typescript
export default defineNuxtConfig({
  modules: ['@nuxthub/core'],
  hub: {
    database: true,  // Enables D1
    blob: true,      // Enables R2
  },
  nitro: {
    preset: 'cloudflare_module',  // Worker preset
    cloudflare: {
      compatibilityDate: '2024-11-01',
      compatibilityFlags: ['nodejs_compat'],
    },
  },
})
```

### `package.json`
```json
{
  "scripts": {
    "deploy": "npx nuxthub deploy",
    "preview": "npx nuxthub preview"
  }
}
```

## Environment Variables

Set environment variables via NuxtHub Admin:
1. Go to [admin.hub.nuxt.com](https://admin.hub.nuxt.com)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add your variables

## Database Migrations

Run database migrations after deployment:
```bash
npm run db:generate  # Generate migration files
npx nuxthub database migrations apply  # Apply to production
```

## Benefits of Worker Deployment

- ✅ **Edge performance**: Runs in 300+ data centers globally
- ✅ **Auto-scaling**: Handles any traffic automatically
- ✅ **Zero cold starts**: Workers are always warm
- ✅ **Integrated resources**: D1 and R2 automatically configured
- ✅ **Free tier**: 100,000 requests/day
- ✅ **Custom domains**: Add your own domain easily

## Alternative: Cloudflare Pages (Git-based)

If you prefer Git-based deployments:
1. Connect your repo to Cloudflare Pages
2. Use these settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Pages will automatically deploy on push

Note: Direct Worker deployment via NuxtHub is recommended for better control and features.
