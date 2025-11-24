# Quick Import to Strapi Cloud

## Your Export File is Ready! ✅

**File**: `export-20251124-195726.tar.gz` (7.5MB)  
**Location**: `./export-20251124-195726.tar.gz`

## Fastest Way to Import

### Method 1: Via Strapi Cloud Dashboard (Easiest)

1. **Go to your Strapi Cloud project**: https://cloud.strapi.io
2. **Open your project dashboard**
3. **Look for "Data Transfer" or "Import" section**
4. **Upload**: `export-20251124-195726.tar.gz`
5. **Wait for import to complete**

### Method 2: Via Strapi CLI

```bash
# 1. Install Strapi CLI (if not already installed)
npm install -g @strapi/strapi

# 2. Login to Strapi Cloud
strapi login

# 3. Navigate to your Strapi Cloud project (if you have local clone)
# OR use the import command directly:

# 4. Import the data
strapi import -f export-20251124-195726.tar.gz
```

### Method 3: Run the Helper Script

```bash
./scripts/import-to-cloud.sh
```

This will guide you through the import process.

## What's in the Export

✅ 64 recipes  
✅ 470 recipe ingredients  
✅ 16 collections  
✅ 52 images (7.4 MB)  
✅ All relationships and links  
✅ Configuration  

## Need Help?

If you get stuck, the file is ready at:
```
/Users/simon.proudfoot/Sites/ai-rec-strapi-new/export-20251124-195726.tar.gz
```

You can upload it manually via the Strapi Cloud dashboard!

