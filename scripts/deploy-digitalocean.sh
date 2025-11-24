#!/bin/bash

# Deploy Strapi to DigitalOcean Droplet
# IP: 46.101.87.225

set -e

DROPLET_IP="46.101.87.225"
SSH_USER="root"
PROJECT_DIR="/var/www/ai-rec-strapi-new"
EXPORT_FILE="export-20251124-195726.tar.gz"

echo "🌊 Deploying Strapi to DigitalOcean"
echo "==================================="
echo ""
echo "Droplet IP: $DROPLET_IP"
echo "Project Dir: $PROJECT_DIR"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# SSH Key path (adjust if needed)
SSH_KEY="${SSH_KEY:-hugo}"

# Step 1: Test SSH connection
echo -e "${BLUE}Step 1: Testing SSH connection...${NC}"
if [ -f "$SSH_KEY" ]; then
    SSH_OPTS="-i $SSH_KEY"
    echo "Using SSH key: $SSH_KEY"
else
    SSH_OPTS=""
    echo "Using default SSH key"
fi

if ! ssh $SSH_OPTS -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$DROPLET_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to droplet${NC}"
    echo "Please ensure:"
    echo "  1. SSH key is added to DigitalOcean"
    echo "  2. Droplet is running"
    echo "  3. Firewall allows SSH (port 22)"
    echo ""
    echo "Try manually:"
    echo "  ssh $SSH_OPTS $SSH_USER@$DROPLET_IP"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# Step 2: Upload setup script
echo -e "${BLUE}Step 2: Uploading server setup script...${NC}"
scp $SSH_OPTS scripts/digitalocean-setup.sh "$SSH_USER@$DROPLET_IP:/tmp/setup.sh" || {
    echo -e "${YELLOW}⚠️  Could not upload setup script, continuing...${NC}"
}
echo ""

# Step 3: Run initial server setup
echo -e "${BLUE}Step 3: Running server setup...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" << 'ENDSSH'
    # Update system
    apt update && apt upgrade -y
    
    # Install Node.js v20
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        apt install -y postgresql postgresql-contrib
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
    fi
    
    # Install Git
    if ! command -v git &> /dev/null; then
        apt install -y git
    fi
    
    # Install Certbot
    if ! command -v certbot &> /dev/null; then
        apt install -y certbot python3-certbot-nginx
    fi
    
    echo "✅ Server setup complete"
ENDSSH

echo -e "${GREEN}✅ Server setup complete${NC}"
echo ""

# Step 4: Create project directory
echo -e "${BLUE}Step 4: Creating project directory...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" "mkdir -p $PROJECT_DIR"
echo -e "${GREEN}✅ Directory created${NC}"
echo ""

# Step 5: Upload project files
echo -e "${BLUE}Step 5: Uploading project files...${NC}"
echo "This may take a few minutes..."
rsync -avz -e "ssh $SSH_OPTS" --exclude 'node_modules' --exclude '.tmp' --exclude '.git' --exclude 'export-*.tar.gz' \
    ./ "$SSH_USER@$DROPLET_IP:$PROJECT_DIR/" || {
    echo -e "${YELLOW}⚠️  rsync not available, using scp...${NC}"
    tar -czf /tmp/strapi-project.tar.gz --exclude='node_modules' --exclude='.tmp' --exclude='.git' --exclude='export-*.tar.gz' .
    scp $SSH_OPTS /tmp/strapi-project.tar.gz "$SSH_USER@$DROPLET_IP:/tmp/"
    ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" "cd $PROJECT_DIR && tar -xzf /tmp/strapi-project.tar.gz && rm /tmp/strapi-project.tar.gz"
}
echo -e "${GREEN}✅ Project files uploaded${NC}"
echo ""

# Step 6: Upload export file
echo -e "${BLUE}Step 6: Uploading export file...${NC}"
scp $SSH_OPTS "$EXPORT_FILE" "$SSH_USER@$DROPLET_IP:$PROJECT_DIR/"
echo -e "${GREEN}✅ Export file uploaded${NC}"
echo ""

# Step 7: Install dependencies and configure
echo -e "${BLUE}Step 7: Installing dependencies...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" << ENDSSH
    cd $PROJECT_DIR
    npm install
    echo "✅ Dependencies installed"
ENDSSH
echo ""

# Step 8: Set up PostgreSQL database
echo -e "${BLUE}Step 8: Setting up PostgreSQL database...${NC}"
echo -e "${YELLOW}Creating database and user...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" << 'ENDSSH'
    # Create database and user if they don't exist
    sudo -u postgres psql << 'PSQL'
        SELECT 1 FROM pg_database WHERE datname = 'strapi' \gexec
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'strapi') THEN
                CREATE DATABASE strapi;
            END IF;
        END
        \$\$;
        
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'strapi') THEN
                CREATE USER strapi WITH PASSWORD 'strapi_secure_password_123';
            END IF;
        END
        \$\$;
        
        GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;
PSQL
    echo "✅ Database created"
ENDSSH
echo ""

# Step 9: Create .env file
echo -e "${BLUE}Step 9: Creating .env file...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" << 'ENDSSH'
    cd $PROJECT_DIR
    cat > .env << 'ENVFILE'
APP_KEYS=toBeModified1,toBeModified2,toBeModified3,toBeModified4
JWT_SECRET=toBeModified
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified
TRANSFER_TOKEN_SALT=toBeModified

DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi_secure_password_123
DATABASE_SSL=false

HOST=0.0.0.0
PORT=1337
NODE_ENV=production
ENVFILE
    echo "✅ .env file created"
    echo -e "${YELLOW}⚠️  IMPORTANT: Update .env with secure secrets!${NC}"
ENDSSH
echo ""

# Step 10: Import data
echo -e "${BLUE}Step 10: Importing data...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" << ENDSSH
    cd $PROJECT_DIR
    npx strapi import -f $EXPORT_FILE || {
        echo "⚠️  Import may have failed or database needs to be set up first"
        echo "You can run manually: npx strapi import -f $EXPORT_FILE"
    }
ENDSSH
echo ""

# Step 11: Build Strapi
echo -e "${BLUE}Step 11: Building Strapi...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" << 'ENDSSH'
    cd $PROJECT_DIR
    npm run build || echo "⚠️  Build may have issues, check logs"
ENDSSH
echo ""

# Step 12: Start with PM2
echo -e "${BLUE}Step 12: Starting Strapi with PM2...${NC}"
ssh $SSH_OPTS "$SSH_USER@$DROPLET_IP" << 'ENDSSH'
    cd $PROJECT_DIR
    pm2 delete strapi 2>/dev/null || true
    pm2 start npm --name "strapi" -- start
    pm2 save
    pm2 startup
ENDSSH
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env file with secure secrets:"
echo "   ssh $SSH_USER@$DROPLET_IP"
echo "   cd $PROJECT_DIR"
echo "   nano .env"
echo ""
echo "2. Set up Nginx reverse proxy (see DIGITALOCEAN_DEPLOY.md)"
echo ""
echo "3. Access Strapi at: http://$DROPLET_IP:1337"
echo ""
echo "4. Check PM2 status:"
echo "   ssh $SSH_USER@$DROPLET_IP 'pm2 status'"
echo ""

