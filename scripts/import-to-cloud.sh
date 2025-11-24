#!/bin/bash

# Import Strapi Data to Strapi Cloud
# This script helps you import your exported data to Strapi Cloud

set -e

echo "☁️  Strapi Cloud Import Helper"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Find the latest export file
EXPORT_FILE=$(ls -t export-*.tar.gz 2>/dev/null | head -1)

if [ -z "$EXPORT_FILE" ]; then
    echo -e "${RED}❌ No export file found${NC}"
    echo "Please export your data first:"
    echo "  ./scripts/export-from-docker-cli.sh"
    exit 1
fi

FILE_SIZE=$(ls -lh "$EXPORT_FILE" | awk '{print $5}')
echo -e "${GREEN}✅ Found export file: $EXPORT_FILE ($FILE_SIZE)${NC}"
echo ""

echo "=========================================="
echo "Import Options:"
echo "=========================================="
echo ""
echo "Option 1: Import via Strapi Cloud CLI (Recommended)"
echo "---------------------------------------------------"
echo ""
echo "1. Install Strapi CLI globally:"
echo "   npm install -g @strapi/strapi"
echo ""
echo "2. Login to Strapi Cloud:"
echo "   strapi login"
echo ""
echo "3. Navigate to your Strapi Cloud project directory"
echo ""
echo "4. Import the data:"
echo "   strapi import -f $EXPORT_FILE"
echo ""
echo "Option 2: Import via Strapi Cloud Dashboard"
echo "--------------------------------------------"
echo ""
echo "1. Go to your Strapi Cloud project dashboard"
echo ""
echo "2. Look for 'Data Transfer' or 'Import/Export' section"
echo ""
echo "3. Upload: $EXPORT_FILE"
echo ""
echo "Option 3: Import via SSH (If you have SSH access)"
echo "-------------------------------------------------"
echo ""
echo "1. Upload file to Strapi Cloud:"
echo "   scp $EXPORT_FILE user@strapi-cloud:/path/to/project/"
echo ""
echo "2. SSH into Strapi Cloud:"
echo "   ssh user@strapi-cloud"
echo ""
echo "3. Navigate to project and import:"
echo "   cd /path/to/project"
echo "   strapi import -f $EXPORT_FILE"
echo ""
echo "=========================================="
echo ""

# Check if Strapi CLI is available
if command -v strapi &> /dev/null; then
    echo -e "${GREEN}✅ Strapi CLI is installed${NC}"
    echo ""
    read -p "Do you want to try importing now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}Attempting to import...${NC}"
        echo "Note: You may need to login first: strapi login"
        echo ""
        strapi import -f "$EXPORT_FILE" || {
            echo ""
            echo -e "${YELLOW}⚠️  Import failed. Please follow the manual steps above.${NC}"
        }
    fi
else
    echo -e "${YELLOW}⚠️  Strapi CLI not found globally${NC}"
    echo ""
    echo "To install: npm install -g @strapi/strapi"
    echo ""
fi

echo ""
echo -e "${GREEN}✅ Export file ready: $EXPORT_FILE${NC}"
echo "File location: $(pwd)/$EXPORT_FILE"
echo ""

