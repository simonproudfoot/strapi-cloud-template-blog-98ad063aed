# How to Upload Export File to Strapi Cloud

## Your Export File
**File**: `export-20251124-195726.tar.gz`  
**Size**: 7.5MB  
**Location**: `/Users/simon.proudfoot/Sites/ai-rec-strapi-new/export-20251124-195726.tar.gz`

## Method 1: Via Strapi Cloud Dashboard (Recommended)

### Step-by-Step:

1. **Go to Strapi Cloud**
   - Open: https://cloud.strapi.io
   - Log in to your account

2. **Select Your Project**
   - Click on your project from the dashboard
   - Wait for it to load

3. **Find Import/Data Transfer**
   - Look for **"Settings"** or **"Data Transfer"** in the left sidebar
   - Or go to: **Settings → Data Transfer** (or **Import/Export**)
   - If you don't see it, try: **Settings → Advanced → Data Transfer**

4. **Upload the File**
   - Click **"Import"** or **"Upload"** button
   - Click **"Choose File"** or drag and drop
   - Select: `export-20251124-195726.tar.gz`
   - Click **"Import"** or **"Upload"**
   - Wait for the import to complete (may take a few minutes)

5. **Verify**
   - Check that your recipes appear
   - Check that collections appear
   - Verify images are showing

## Method 2: Via Strapi CLI

If you have SSH access or can run commands:

```bash
# 1. Install Strapi CLI globally
npm install -g @strapi/strapi

# 2. Login to Strapi Cloud
strapi login

# 3. Navigate to your project directory (if cloned locally)
cd /path/to/your/strapi-cloud-project

# 4. Copy the export file to your project directory
cp /Users/simon.proudfoot/Sites/ai-rec-strapi-new/export-20251124-195726.tar.gz .

# 5. Import the data
strapi import -f export-20251124-195726.tar.gz
```

## Method 3: Via File Transfer (If you have SSH access)

If Strapi Cloud provides SSH access:

```bash
# 1. Upload file to Strapi Cloud server
scp export-20251124-195726.tar.gz user@your-strapi-cloud-host:/path/to/project/

# 2. SSH into Strapi Cloud
ssh user@your-strapi-cloud-host

# 3. Navigate to project
cd /path/to/project

# 4. Import
strapi import -f export-20251124-195726.tar.gz
```

## Method 4: Via Strapi Cloud CLI (if available)

Some Strapi Cloud instances have a CLI:

```bash
# Check if Strapi Cloud CLI is available
strapi-cloud --help

# If available, you might be able to:
strapi-cloud import export-20251124-195726.tar.gz
```

## Troubleshooting

### Can't find Import option in dashboard?

- Try: **Settings → Advanced**
- Try: **Project Settings → Data Management**
- Check Strapi Cloud documentation for your specific plan
- Contact Strapi Cloud support

### File too large?

- The file is 7.5MB, which should be fine
- If it fails, try compressing it further or contact support

### Import fails?

- Ensure your Strapi Cloud instance is running Strapi v5
- Check that content types match between local and cloud
- Review error logs in Strapi Cloud dashboard

## Quick Reference

**File to upload**: `export-20251124-195726.tar.gz`  
**File path**: `/Users/simon.proudfoot/Sites/ai-rec-strapi-new/export-20251124-195726.tar.gz`  
**File size**: 7.5MB  

## Need Help?

- Strapi Cloud Docs: https://docs.strapi.io/cloud
- Strapi Cloud Support: Check your dashboard for support options

