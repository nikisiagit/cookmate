# Cloudflare Token Setup for Worker Deployment

You mentioned you created a Cloudflare token for NuxtHub. Here's how to use it:

## Your Current Setup (Already Working!)

**Good news**: Your app is already deployed as a Cloudflare Worker via Pages! Cloudflare Pages runs on Workers under the hood, so you're already using Workers technology.

**Current deployment**: Cloudflare Pages (Worker-based)
- Automatic deployments on Git push
- Runs on Cloudflare's edge network (Workers)
- D1 and R2 automatically configured

## If You Want Manual Worker Deployment

If you prefer to deploy manually with your token instead of Git-based deployment:

### Step 1: Get Your Cloudflare Account ID

```bash
# Login with wrangler
npx wrangler login

# Or get your account ID from:
# https://dash.cloudflare.com → Click your account → Copy Account ID
```

### Step 2: Configure Your Token

```bash
# Set your API token as an environment variable
export CLOUDFLARE_API_TOKEN="your-token-here"

# Or add to ~/.bashrc or ~/.zshrc for persistence:
echo 'export CLOUDFLARE_API_TOKEN="your-token-here"' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Update wrangler.toml

Uncomment and fill in these lines in `wrangler.toml`:

```toml
account_id = "your-account-id-here"
main = ".output/server/index.mjs"
```

### Step 4: Set Up D1 Database (if not exists)

```bash
# Create D1 database
npx wrangler d1 create cookmate-db

# Note the database_id from output, then update wrangler.toml:
# [[d1_databases]]
# binding = "DB"
# database_name = "cookmate-db"
# database_id = "the-id-from-above"
```

### Step 5: Set Up R2 Storage (if not exists)

```bash
# Create R2 bucket
npx wrangler r2 bucket create cookmate-storage

# Update wrangler.toml:
# [[r2_buckets]]
# binding = "BLOB"
# bucket_name = "cookmate-storage"
```

### Step 6: Build and Deploy

```bash
# Build your app
npm run build

# Deploy as Worker
npx wrangler deploy
```

## Token Permissions Required

Your Cloudflare API token needs:
- ✅ Account → Workers Scripts → Edit
- ✅ Account → D1 → Edit
- ✅ Account → R2 → Edit
- ✅ Account → Workers KV Storage → Edit (optional)

Create or edit your token at:
https://dash.cloudflare.com/profile/api-tokens

## Recommendation

**Stick with Cloudflare Pages (your current setup)** unless you need:
- Manual deployment control
- Multiple environments beyond production/preview
- Direct Worker configuration access

Pages gives you Worker performance with easier deployment workflow.

## Verify Your Token Works

Test your token:
```bash
export CLOUDFLARE_API_TOKEN="your-token"
npx wrangler whoami
```

This should show your account details if the token is valid.
