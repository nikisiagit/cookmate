# Bind Database and Storage to Your Cloudflare Pages Site

You've successfully created:
- ✅ D1 Database: `cookmate-db` (ID: e33f9c74-fb35-4fbe-9d26-5bb5f48d3f52)
- ✅ R2 Bucket: `cookmate-storage`

Now you need to connect them to your Cloudflare Pages site.

## Step 1: Go to Your Pages Project

1. Visit https://dash.cloudflare.com
2. Click **Workers & Pages** in the left sidebar
3. Find and click on your **cookmate** Pages project

## Step 2: Bind the D1 Database

1. Click on **Settings** tab
2. Scroll down to **Bindings**
3. Click **Add** next to "D1 database bindings"
4. Configure:
   - **Variable name**: `DB` (must be exactly "DB" in uppercase)
   - **D1 database**: Select `cookmate-db` from the dropdown
5. Click **Save**

## Step 3: Bind the R2 Bucket

1. Still in **Settings** → **Bindings**
2. Click **Add** next to "R2 bucket bindings"
3. Configure:
   - **Variable name**: `BLOB` (must be exactly "BLOB" in uppercase)
   - **R2 bucket**: Select `cookmate-storage` from the dropdown
4. Click **Save**

## Step 4: Redeploy Your Site

After adding the bindings:
1. Go to the **Deployments** tab
2. Find your latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Retry deployment**

Or just push a new commit to your branch and it will auto-deploy with the bindings.

## Verify It Works

Once redeployed, your site should now be able to:
- ✅ Store recipes in the D1 database
- ✅ Upload and store recipe images in R2 storage

Visit your site and try creating a recipe to test!

## Important Variable Names

The binding names MUST match what your app expects:
- Database binding: `DB` (uppercase)
- Storage binding: `BLOB` (uppercase)

These match your NuxtHub configuration in `nuxt.config.ts`:
```typescript
hub: {
  database: true,  // Uses DB binding
  blob: true,      // Uses BLOB binding
}
```

## Troubleshooting

**If you don't see the bindings option:**
- Make sure you're on the **Settings** tab of your Pages project
- Scroll down to find the **Bindings** section

**If you don't see your database/bucket in the dropdown:**
- Refresh the page
- Make sure you're looking at the correct Cloudflare account

**If your site still doesn't work after binding:**
- Check the **Functions** logs in your Pages project
- Make sure you redeployed after adding the bindings

---

That's it! Your database and storage are now connected to your Cloudflare Pages site.
