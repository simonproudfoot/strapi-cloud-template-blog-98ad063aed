# Import Local Database to Strapi Cloud

## Quick Guide

Your content types are already live in Strapi Cloud. Now you need to import your data.

## Step-by-Step Process

### Step 1: Export Data from Local Strapi

1. **Start your local Strapi:**
   ```bash
   npm run develop
   ```

2. **Open admin panel:**
   - Go to http://localhost:1337/admin
   - Log in with your admin credentials

3. **Generate Transfer Token:**
   - Navigate to: **Settings** → **Transfer Tokens**
   - Click **"Generate Transfer Token"**
   - Give it a name (e.g., "Export to Cloud")
   - Set expiration (e.g., 7 days)
   - Click **"Save"**
   - **Copy the token** (you'll need it)

4. **Export Data:**
   - Navigate to: **Settings** → **Import/Export**
   - Click **"Export"** button
   - Wait for the export to complete
   - **Download the file** (usually `export-YYYY-MM-DD.tar.gz`)

### Step 2: Upload Media Files (Optional but Recommended)

Your exported data references media files. You may need to upload them:

```bash
# Check what media files you have locally
ls -lh public/uploads/

# You'll need to upload these to Strapi Cloud
# Option 1: Upload via admin panel after import
# Option 2: Use Strapi Cloud's file upload feature
```

### Step 3: Import Data to Strapi Cloud

1. **Open Strapi Cloud Admin Panel:**
   - Go to your Strapi Cloud project URL
   - Log in (create admin user if needed)

2. **Import Data:**
   - Navigate to: **Settings** → **Import/Export**
   - Click **"Import"** button
   - **Upload** your exported `.tar.gz` file
   - Wait for import to complete

3. **Verify Import:**
   - Check that recipes appear
   - Check that collections appear
   - Verify relationships are intact
   - Test API endpoints

### Step 4: Upload Media Files to Strapi Cloud

If you have media files:

1. **Option A: Via Admin Panel**
   - Go to Media Library
   - Upload files manually
   - Or use bulk upload if available

2. **Option B: Via API**
   - Use Strapi's upload API
   - Or use a migration script

## Alternative: Direct Database Transfer (Advanced)

If you have access to both databases, you could:

1. Export from SQLite
2. Transform data format
3. Import to PostgreSQL

But the Transfer Token method is recommended and safer.

## Troubleshooting

### Import Fails

- **Check file size**: Strapi Cloud may have size limits
- **Check format**: Ensure it's a valid Strapi export file
- **Check logs**: Look at Strapi Cloud logs for errors

### Data Missing After Import

- **Check relationships**: Some relationships may need to be recreated
- **Check permissions**: Ensure content is published
- **Check API**: Verify API endpoints return data

### Media Files Not Showing

- **Upload media files** separately via admin panel
- **Check file paths** in exported data
- **Re-upload** via Media Library

## Quick Commands

```bash
# 1. Start local Strapi
npm run develop

# 2. Export via admin panel (see steps above)

# 3. Import to Strapi Cloud via admin panel (see steps above)
```

## What Gets Exported/Imported

✅ **Content Types Data**: All recipes, collections, posts, etc.  
✅ **Relationships**: Links between content types  
✅ **Components**: Component data  
⚠️ **Media Files**: May need separate upload  
❌ **Users**: Admin users are NOT exported (create new ones)  
❌ **Permissions**: May need to be reconfigured  

## Need Help?

- Strapi Transfer Docs: https://docs.strapi.io/user-docs/settings/import-export-data
- Strapi Cloud Support: Check Strapi Cloud dashboard support section

