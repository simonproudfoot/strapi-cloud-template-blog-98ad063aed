#!/bin/bash

# Database Migration Script for Strapi v4 → v5
# This script helps you safely migrate your database and config

set -e

echo "🚀 Strapi Database Migration Helper"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if database exists
if [ ! -f ".tmp/data.db" ]; then
    echo -e "${RED}❌ Database file not found at .tmp/data.db${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database file found: .tmp/data.db${NC}"
ls -lh .tmp/data.db
echo ""

# Create backup
echo "📦 Creating backup..."
mkdir -p backups
BACKUP_FILE="backups/data.db.backup-$(date +%Y%m%d-%H%M%S)"
cp .tmp/data.db "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env file from example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from .env.example${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found, creating basic .env${NC}"
        cat > .env << EOF
# Strapi Environment Variables
# Generate secrets with: openssl rand -base64 32

APP_KEYS=toBeModified1,toBeModified2,toBeModified3,toBeModified4
JWT_SECRET=toBeModified
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified
TRANSFER_TOKEN_SALT=toBeModified

# Database
DATABASE_FILENAME=.tmp/data.db

# Server
HOST=0.0.0.0
PORT=1337
EOF
        echo -e "${GREEN}✅ Created basic .env file${NC}"
        echo -e "${RED}⚠️  IMPORTANT: Update .env with secure random secrets!${NC}"
        echo "   Run: openssl rand -base64 32 (multiple times for APP_KEYS)"
    fi
    echo ""
else
    echo -e "${GREEN}✅ .env file exists${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

echo "===================================="
echo "Migration Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with secure secrets (if needed)"
echo "2. Run: npm run develop"
echo "3. Strapi will automatically migrate the database on first start"
echo ""
echo "Backup location: $BACKUP_FILE"
echo ""

