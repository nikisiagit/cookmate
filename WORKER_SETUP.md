# Worker Deployment Setup Instructions

Your Worker configuration is ready! Follow these steps to complete the setup on your local machine.

## Prerequisites

You have:
- ✅ Account ID: `7cd05ae6e3cf8bc7d1e8294fa52a6b46`
- ✅ API Token: `Nq67aKHUj6ALUaILtXnPBx3qykkvwVs0kft-ZqxX`
- ✅ wrangler.toml configured

## Step 1: Set Your API Token

On your local machine, run:

```bash
export CLOUDFLARE_API_TOKEN="Nq67aKHUj6ALUaILtXnPBx3qykkvwVs0kft-ZqxX"
```

Or add it to your `~/.bashrc` or `~/.zshrc` for persistence:

```bash
echo 'export CLOUDFLARE_API_TOKEN="Nq67aKHUj6ALUaILtXnPBx3qykkvwVs0kft-ZqxX"' >> ~/.bashrc
source ~/.bashrc
```

## Step 2: Verify Token Works

```bash
npx wrangler whoami
```

You should see your account details.

## Step 3: Create D1 Database

```bash
npx wrangler d1 create cookmate-db
```

**Important:** Copy the output! It will look like:

```toml
[[d1_databases]]
binding = "DB"
database_name = "cookmate-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Save the `database_id` - you'll need it for the next step.

## Step 4: Create R2 Bucket

```bash
npx wrangler r2 bucket create cookmate-storage
```

You should see: "Created bucket 'cookmate-storage'"

## Step 5: Update wrangler.toml

Edit `wrangler.toml` and uncomment/update the D1 section with your database_id:

```toml
[[d1_databases]]
binding = "DB"
database_name = "cookmate-db"
database_id = "your-actual-database-id-from-step-3"
```

Uncomment the R2 section:

```toml
[[r2_buckets]]
binding = "BLOB"
bucket_name = "cookmate-storage"
```

## Step 6: Build Your App

```bash
npm run build
```

This creates the `.output/server/index.mjs` file that your Worker will use.

## Step 7: Deploy Your Worker

```bash
npx wrangler deploy
```

This will:
1. Upload your Worker code
2. Bind the D1 database
3. Bind the R2 storage
4. Deploy to Cloudflare's edge

You'll get a URL like: `https://cookmate.your-subdomain.workers.dev`

## Step 8: Set Up Database Schema

If you need to run migrations:

```bash
# Generate migration files
npm run db:generate

# Apply migrations to your D1 database
npx wrangler d1 execute cookmate-db --file=./drizzle/migrations/0000_your_migration.sql
```

Or check your Drizzle migration files in the `drizzle` folder and apply them.

## Verify Deployment

Visit your Worker URL and test your app!

## Troubleshooting

### Token Permission Issues

If you get permission errors, ensure your token has:
- ✅ Account → Workers Scripts → Edit
- ✅ Account → D1 → Edit
- ✅ Account → R2 → Edit

Create/edit token at: https://dash.cloudflare.com/profile/api-tokens

### Build Issues

If build fails, ensure:
```bash
npm install
npm run build
```

### Database Connection Issues

Check that your `wrangler.toml` has the correct binding name "DB" (uppercase) matching your NuxtHub configuration.

## Managing Your Worker

### View Logs
```bash
npx wrangler tail
```

### Update Worker
After making code changes:
```bash
npm run build
npx wrangler deploy
```

### View in Dashboard
https://dash.cloudflare.com → Workers & Pages → cookmate

## Environment Variables

Set environment variables:
```bash
npx wrangler secret put VARIABLE_NAME
```

Or in the dashboard: Workers & Pages → cookmate → Settings → Variables

---

Once you've completed these steps, let me know if you need help with anything!
