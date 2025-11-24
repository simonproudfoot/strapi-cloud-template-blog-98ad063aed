#!/bin/bash

# DigitalOcean Server Setup Script
# Run this ON your DigitalOcean droplet to set up Strapi

set -e

echo "🌊 DigitalOcean Strapi Setup"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Update system
echo -e "${BLUE}Updating system...${NC}"
apt update && apt upgrade -y

# Install Node.js
echo -e "${BLUE}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo -e "${BLUE}Installing PM2...${NC}"
npm install -g pm2

# Install PostgreSQL
echo -e "${BLUE}Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Install Nginx
echo -e "${BLUE}Installing Nginx...${NC}"
apt install -y nginx

# Install Git
echo -e "${BLUE}Installing Git...${NC}"
apt install -y git

# Install Certbot for SSL
echo -e "${BLUE}Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${GREEN}✅ System setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL database:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE strapi;"
echo "   CREATE USER strapi WITH PASSWORD 'your-password';"
echo "   GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;"
echo ""
echo "2. Clone or upload your Strapi project"
echo "3. Configure .env file"
echo "4. Import your data: npx strapi import -f export-20251124-195726.tar.gz"
echo "5. Build: npm run build"
echo "6. Start: pm2 start npm --name 'strapi' -- start"
echo ""

