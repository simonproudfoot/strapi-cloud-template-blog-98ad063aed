# Database & Config Migration Guide

## Overview

Your database and config will be automatically migrated when you start Strapi v5 for the first time. This guide walks you through the process.

## Current Status

✅ **Database file exists**: `.tmp/data.db` (1.9MB) - Contains all your recipes, collections, and data  
✅ **Config files**: All configuration files are in place  
⚠️ **Version upgrade**: Migrating from Strapi v4.24.0 → v5.28.0

## Step-by-Step Migration Process

### 1. Backup Your Database (IMPORTANT!)

Before starting, create a backup of your database:

```bash
# Create backup directory
mkdir -p backups

# Copy the database file
cp .tmp/data.db backups/data.db.backup-$(date +%Y%m%d-%H%M%S)

# Verify backup was created
ls -lh backups/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example env file if it exists
cp .env.example .env 2>/dev/null || touch .env

# Edit .env and add required variables
# At minimum, you need:
# - APP_KEYS (comma-separated, at least one key)
# - JWT_SECRET
# - API_TOKEN_SALT
# - ADMIN_JWT_SECRET
```

Generate secrets if needed:
```bash
# Generate random secrets (run multiple times for APP_KEYS)
openssl rand -base64 32
```

### 4. Start Strapi (This Triggers Migration)

```bash
npm run develop
```

**What happens during first start:**
1. Strapi detects the v4 database
2. Automatically migrates schema to v5 format
3. Updates tables to match your content types
4. Preserves all your data

### 5. Monitor the Migration

Watch the console output for:
- ✅ "Database migration completed successfully"
- ✅ "Content types loaded"
- ⚠️ Any warnings or errors

### 6. Verify Migration Success

After Strapi starts:

1. **Check Admin Panel**
   - Open http://localhost:1337/admin
   - Log in with your admin credentials
   - Verify all content types appear (recipe, collection, recipe-ingredient, post)

2. **Verify Data**
   - Check that recipes are visible
   - Check that collections are visible
   - Verify relationships are intact

3. **Check Database**
   ```bash
   # Verify database file still exists and is updated
   ls -lh .tmp/data.db
   ```

## Configuration Files Status

All config files are already migrated:

✅ **`config/database.js`** - SQLite configuration  
✅ **`config/server.js`** - Server settings  
✅ **`config/admin.js`** - Admin panel settings  
✅ **`config/api.js`** - API configuration  
✅ **`config/middlewares.js`** - CORS and middleware  
✅ **`config/plugins.js`** - Plugin configuration (now empty after removing plugin)

## Troubleshooting

### If Migration Fails

1. **Stop Strapi** (Ctrl+C)

2. **Restore from Backup**
   ```bash
   cp backups/data.db.backup-* .tmp/data.db
   ```

3. **Check Error Messages**
   - Look for specific table/column errors
   - Check content type schemas for compatibility issues

4. **Manual Schema Fixes** (if needed)
   - Review content type schemas in `src/api/*/content-types/*/schema.json`
   - Ensure all fields are compatible with Strapi v5

### Common Issues

**Issue**: "Table already exists" errors
- **Solution**: Strapi will handle this automatically, but you can delete `.tmp/data.db` and let Strapi recreate it (⚠️ **WARNING**: This deletes all data!)

**Issue**: "Column type mismatch" errors
- **Solution**: Check your schema.json files for deprecated field types

**Issue**: "Foreign key constraint" errors
- **Solution**: Relationships should migrate automatically, but verify your schema relationships

## Post-Migration Checklist

After successful migration:

- [ ] All content types visible in admin panel
- [ ] Data is accessible and correct
- [ ] Relationships between content types work
- [ ] API endpoints return correct data
- [ ] No console errors or warnings
- [ ] Database file size is reasonable (should be similar to original)

## What Gets Migrated Automatically

✅ **Database Schema** - Tables, columns, indexes  
✅ **Content Types** - All your custom content types  
✅ **Components** - All reusable components  
✅ **Relationships** - Links between content types  
✅ **Data** - All your recipes, collections, etc.  
✅ **Media Files** - Uploaded images and files  
✅ **Users & Permissions** - Admin users and roles  

## What You Need to Verify Manually

⚠️ **Content Type Fields** - Ensure all fields migrated correctly  
⚠️ **Relationships** - Test that relationships still work  
⚠️ **API Responses** - Verify API returns expected data  
⚠️ **Permissions** - Check that permissions are correct  

## Next Steps After Migration

1. **Test Everything**
   - Create a new recipe
   - Update an existing recipe
   - Create a collection
   - Test API endpoints

2. **Update Your Frontend**
   - Point your Nuxt app to the new Strapi instance
   - Test all API calls
   - Verify data displays correctly

3. **Deploy**
   - Once verified locally, deploy to Strapi Cloud
   - Set environment variables in Strapi Cloud dashboard
   - Upload database file if needed (or let it sync)

## Need Help?

If migration fails:
1. Check Strapi logs for specific errors
2. Review Strapi v5 migration guide: https://docs.strapi.io/dev-docs/migration/v4-to-v5
3. Check for breaking changes: https://docs.strapi.io/dev-docs/migration/v4-to-v5/breaking-changes

