# Cloudflare Worker Deployment Guide

Your CookMate app is configured to deploy as a **Cloudflare Worker**!

## Deployment Options

Since NuxtHub Admin has been sunset, you have two main options:

### Option 1: Cloudflare Pages (Recommended - Currently Working)

This is the **easiest** option since you already have it working!

**How it works**: Cloudflare Pages runs on Workers under the hood, so you're already using Workers.

**Setup**:
1. Your repo is connected to Cloudflare Pages
2. Every push to your branch triggers an automatic deployment
3. Your app runs as a Worker on the edge

**Benefits**:
- Already working for you
- Automatic deployments on Git push
- No manual deployment needed
- Same Worker performance

**Dashboard**: [https://dash.cloudflare.com](https://dash.cloudflare.com) → Pages

---

### Option 2: Direct Worker Deployment with Wrangler

Deploy manually using Cloudflare's CLI tool.

#### Step 1: Set up Cloudflare API Token

You mentioned you created a token - let's configure it:

```bash
# Set your Cloudflare API token
export CLOUDFLARE_API_TOKEN="your-token-here"

# Or add to your shell config (~/.bashrc or ~/.zshrc):
echo 'export CLOUDFLARE_API_TOKEN="your-token-here"' >> ~/.bashrc
```

Your token needs these permissions:
- **Account** → Workers Scripts → Edit
- **Account** → D1 → Edit
- **Account** → R2 → Edit

#### Step 2: Update wrangler.toml

You'll need to configure your account ID and Worker name (I'll help with this next).

#### Step 3: Deploy

```bash
npx wrangler deploy
```

This deploys your app directly as a Worker.

---

### Option 3: NuxtHub CLI with Token

The NuxtHub CLI still works with your Cloudflare token:

```bash
# Authenticate with your token
export CLOUDFLARE_API_TOKEN="your-token-here"

# Deploy
npm run deploy
```

Note: NuxtHub Admin dashboard is no longer available, but the CLI deployment still functions.

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

Set environment variables in Cloudflare Dashboard:
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your project
3. Go to **Settings** → **Environment Variables**
4. Add your variables for production/preview environments

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
