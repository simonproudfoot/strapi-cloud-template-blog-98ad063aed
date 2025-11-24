# Strapi Cloud Migration Guide

## Important: Strapi Cloud Uses PostgreSQL, Not SQLite

⚠️ **Key Difference**: Your local database is SQLite (`.tmp/data.db`), but Strapi Cloud uses PostgreSQL. The migration process is different.

## Migration Strategy for Strapi Cloud

You have **two options**:

### Option 1: Migrate Locally First, Then Deploy (Recommended)

This ensures your database is migrated to v5 before deploying to Strapi Cloud.

#### Step 1: Migrate Locally

1. **Run the migration locally:**
   ```bash
   # Backup your database
   ./scripts/migrate-database.sh
   
   # Start Strapi locally (this migrates the SQLite DB to v5)
   npm run develop
   ```

2. **Verify migration locally:**
   - Check admin panel: http://localhost:1337/admin
   - Verify all content types appear
   - Verify data is accessible
   - Test creating/updating content

#### Step 2: Export Data from Local Strapi

Once migrated locally, export your data:

```bash
# Option A: Use Strapi's data transfer feature
# In admin panel: Settings → Transfer Tokens → Generate Transfer Token
# Then use the transfer API to export data

# Option B: Use the Strapi CLI to export
strapi export --no-encrypt --file backup.tar.gz
```

#### Step 3: Deploy to Strapi Cloud

1. **Connect your repository to Strapi Cloud:**
   - Go to Strapi Cloud dashboard
   - Connect your Git repository
   - Strapi Cloud will automatically detect your project

2. **Set Environment Variables in Strapi Cloud:**
   - Go to your project settings in Strapi Cloud dashboard
   - Add all required environment variables:
     - `APP_KEYS`
     - `JWT_SECRET`
     - `API_TOKEN_SALT`
     - `ADMIN_JWT_SECRET`
     - `TRANSFER_TOKEN_SALT`
     - Any other custom variables

3. **Deploy:**
   - Push your code to the connected Git repository
   - Strapi Cloud will automatically build and deploy
   - Or use CLI: `strapi deploy`

#### Step 4: Import Data to Strapi Cloud

Once deployed, import your migrated data:

```bash
# Use Strapi's data transfer feature
# In Strapi Cloud admin panel: Settings → Import/Export → Import
# Upload your exported backup.tar.gz file
```

### Option 2: Deploy First, Then Migrate in Cloud

This approach lets Strapi Cloud handle the migration, but requires uploading your database.

#### Step 1: Deploy Code to Strapi Cloud

1. **Push your code:**
   ```bash
   git add .
   git commit -m "Migrate to Strapi v5"
   git push origin main
   ```

2. **Strapi Cloud will:**
   - Build your project
   - Create a PostgreSQL database
   - Start Strapi v5

#### Step 2: Upload Database to Strapi Cloud

⚠️ **Note**: Strapi Cloud doesn't directly support SQLite uploads. You'll need to:

1. **Migrate locally first** (see Option 1, Step 1)
2. **Export data** from your local migrated instance
3. **Import into Strapi Cloud** using the data transfer feature

## Using Strapi Cloud CLI

The `strapi deploy` command in your `package.json` is already set up:

```bash
# Install Strapi CLI globally (if not already installed)
npm install -g @strapi/strapi

# Login to Strapi Cloud
strapi login

# Deploy your project
npm run deploy
# or
strapi deploy
```

## Important Notes

### Database Differences

- **Local**: SQLite (`.tmp/data.db`)
- **Strapi Cloud**: PostgreSQL (managed by Strapi Cloud)
- **Migration**: Happens automatically when Strapi v5 starts

### What Gets Deployed Automatically

✅ **Code**: All your content types, components, config files  
✅ **Schema**: Content type schemas are deployed with code  
❌ **Data**: Database data is NOT deployed automatically  
❌ **Media Files**: Uploaded files need to be migrated separately  

### What You Need to Do Manually

1. **Environment Variables**: Set in Strapi Cloud dashboard
2. **Database Data**: Export from local, import to Cloud
3. **Media Files**: Upload via admin panel or use transfer feature
4. **Admin Users**: Create new admin user in Strapi Cloud (or import)

## Step-by-Step: Recommended Approach

### Phase 1: Local Migration

```bash
# 1. Backup database
./scripts/migrate-database.sh

# 2. Migrate locally
npm run develop

# 3. Verify everything works locally
# - Check admin panel
# - Test content types
# - Verify data integrity
```

### Phase 2: Export Data

```bash
# Export data from local Strapi
# Use admin panel: Settings → Transfer Tokens
# Generate token, then use transfer API or admin UI
```

### Phase 3: Deploy to Strapi Cloud

```bash
# 1. Ensure code is committed
git add .
git commit -m "Ready for Strapi Cloud deployment"
git push origin main

# 2. Deploy via CLI (or let Git auto-deploy)
npm run deploy
```

### Phase 4: Configure Strapi Cloud

1. **Set Environment Variables** in Strapi Cloud dashboard
2. **Wait for build to complete**
3. **Access admin panel** at your Strapi Cloud URL

### Phase 5: Import Data

1. **Import exported data** via admin panel
2. **Upload media files** if needed
3. **Create admin user** if needed
4. **Verify data** in admin panel

## Troubleshooting

### Build Fails in Strapi Cloud

- Check build logs in Strapi Cloud dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check for any build errors in logs

### Database Migration Issues

- Migrate locally first to catch issues early
- Check Strapi Cloud logs for migration errors
- Verify content type schemas are compatible with v5

### Data Import Fails

- Ensure you exported from a migrated (v5) instance
- Check transfer token is valid
- Verify file size limits in Strapi Cloud

## Quick Reference

```bash
# Local migration
./scripts/migrate-database.sh
npm run develop

# Export data (after local migration)
# Use admin panel: Settings → Transfer Tokens

# Deploy to Strapi Cloud
npm run deploy
# or
strapi deploy

# Import data in Strapi Cloud
# Use admin panel: Settings → Import/Export
```

## Need Help?

- Strapi Cloud Docs: https://docs.strapi.io/cloud
- Strapi Cloud CLI: https://docs.strapi.io/cloud/cli/cloud-cli
- Data Transfer: https://docs.strapi.io/user-docs/settings/import-export-data

