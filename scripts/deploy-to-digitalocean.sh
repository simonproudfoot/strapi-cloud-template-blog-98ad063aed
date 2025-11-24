#!/bin/bash

# Deploy Strapi to DigitalOcean Helper Script
# This script helps you transfer and import your data to DigitalOcean

set -e

echo "🌊 DigitalOcean Deployment Helper"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check for export file
EXPORT_FILE="export-20251124-195726.tar.gz"
if [ ! -f "$EXPORT_FILE" ]; then
    echo -e "${RED}❌ Export file not found: $EXPORT_FILE${NC}"
    echo "Please export your data first:"
    echo "  ./scripts/export-from-docker-cli.sh"
    exit 1
fi

echo -e "${GREEN}✅ Found export file: $EXPORT_FILE${NC}"
echo ""

# Get DigitalOcean server details
read -p "Enter your DigitalOcean droplet IP or hostname: " DROPLET_IP
read -p "Enter SSH user (usually 'root'): " SSH_USER
read -p "Enter project directory on server (e.g., /var/www/ai-rec-strapi-new): " REMOTE_DIR

echo ""
echo "=========================================="
echo "Deployment Steps:"
echo "=========================================="
echo ""
echo "1. Transfer export file to DigitalOcean..."
echo ""

# Transfer export file
echo -e "${BLUE}Uploading export file...${NC}"
scp "$EXPORT_FILE" "$SSH_USER@$DROPLET_IP:$REMOTE_DIR/" || {
    echo -e "${RED}❌ Failed to upload file${NC}"
    echo "Make sure:"
    echo "  - SSH key is set up"
    echo "  - Remote directory exists"
    echo "  - You have write permissions"
    exit 1
}

echo -e "${GREEN}✅ File uploaded successfully${NC}"
echo ""

echo "2. Import data on DigitalOcean server..."
echo ""
echo -e "${YELLOW}Run these commands on your DigitalOcean server:${NC}"
echo ""
echo "  ssh $SSH_USER@$DROPLET_IP"
echo "  cd $REMOTE_DIR"
echo "  npx strapi import -f $EXPORT_FILE"
echo ""
echo "Or run this command now:"
echo ""
read -p "Do you want to import now via SSH? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Connecting to server and importing...${NC}"
    ssh "$SSH_USER@$DROPLET_IP" "cd $REMOTE_DIR && npx strapi import -f $EXPORT_FILE" || {
        echo -e "${YELLOW}⚠️  Import may have failed. Check the output above.${NC}"
        echo "You can manually run:"
        echo "  ssh $SSH_USER@$DROPLET_IP"
        echo "  cd $REMOTE_DIR"
        echo "  npx strapi import -f $EXPORT_FILE"
    }
fi

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Build Strapi:"
echo "   ssh $SSH_USER@$DROPLET_IP"
echo "   cd $REMOTE_DIR"
echo "   npm run build"
echo ""
echo "2. Start Strapi with PM2:"
echo "   pm2 start npm --name 'strapi' -- start"
echo "   pm2 save"
echo ""
echo "3. Set up Nginx (see DIGITALOCEAN_DEPLOY.md)"
echo ""
echo -e "${GREEN}✅ Export file transferred to DigitalOcean!${NC}"
echo ""

