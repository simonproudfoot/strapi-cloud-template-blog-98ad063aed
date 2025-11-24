# Deploy to DigitalOcean

## Overview

This guide helps you deploy your Strapi project to DigitalOcean and import your exported data.

## Prerequisites

- DigitalOcean account
- A Droplet (server) running Ubuntu/Debian
- SSH access to your Droplet
- Your export file: `export-20251124-195726.tar.gz`

## Step 1: Set Up Your DigitalOcean Droplet

### Create a Droplet

1. **Go to DigitalOcean**: https://cloud.digitalocean.com
2. **Create → Droplets**
3. **Choose**:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: At least 2GB RAM (4GB recommended)
   - **Region**: Choose closest to you
   - **Authentication**: SSH keys (recommended) or password
4. **Create Droplet**

### Initial Server Setup

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Git
apt install -y git

# Verify installations
node --version  # Should show v20.x.x
npm --version
pm2 --version
```

## Step 2: Deploy Your Strapi Project

### Option A: Clone from Git (Recommended)

```bash
# On your DigitalOcean droplet
cd /var/www
git clone https://github.com/your-username/ai-rec-strapi-new.git
cd ai-rec-strapi-new

# Install dependencies
npm install

# Create .env file
nano .env
```

Add your environment variables:
```env
APP_KEYS=key1,key2,key3,key4
JWT_SECRET=your-secret-here
API_TOKEN_SALT=your-salt-here
ADMIN_JWT_SECRET=your-admin-secret-here
TRANSFER_TOKEN_SALT=your-transfer-salt-here

# Database (use PostgreSQL for production)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-db-password

# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
```

### Option B: Upload Project Files

```bash
# On your local machine, create a tarball
cd /Users/simon.proudfoot/Sites/ai-rec-strapi-new
tar -czf strapi-project.tar.gz --exclude='node_modules' --exclude='.tmp' --exclude='.git' .

# Upload to DigitalOcean
scp strapi-project.tar.gz root@your-droplet-ip:/var/www/

# On DigitalOcean droplet
ssh root@your-droplet-ip
cd /var/www
tar -xzf strapi-project.tar.gz
cd ai-rec-strapi-new
npm install
```

## Step 3: Set Up PostgreSQL Database

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE strapi;
CREATE USER strapi WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;
\q

# Update .env with database credentials
```

## Step 4: Transfer and Import Your Data

### Transfer Export File to DigitalOcean

```bash
# From your local machine
scp export-20251124-195726.tar.gz root@your-droplet-ip:/var/www/ai-rec-strapi-new/
```

### Import the Data

```bash
# SSH into your droplet
ssh root@your-droplet-ip
cd /var/www/ai-rec-strapi-new

# Import the data
npx strapi import -f export-20251124-195726.tar.gz
```

## Step 5: Build and Start Strapi

```bash
# Build the admin panel
npm run build

# Start with PM2
pm2 start npm --name "strapi" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the instructions it gives you
```

## Step 6: Set Up Nginx Reverse Proxy

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/strapi
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 7: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Quick Setup Script

I've created a helper script - see `scripts/deploy-to-digitalocean.sh`

## Troubleshooting

### Check Strapi logs
```bash
pm2 logs strapi
```

### Restart Strapi
```bash
pm2 restart strapi
```

### Check database connection
```bash
# Test PostgreSQL connection
sudo -u postgres psql -d strapi -c "SELECT version();"
```

### Check Nginx status
```bash
systemctl status nginx
nginx -t
```

## File Locations

- **Project**: `/var/www/ai-rec-strapi-new`
- **Export file**: `/var/www/ai-rec-strapi-new/export-20251124-195726.tar.gz`
- **PM2 config**: `~/.pm2`
- **Nginx config**: `/etc/nginx/sites-available/strapi`

## Next Steps

1. ✅ Deploy project to DigitalOcean
2. ✅ Set up PostgreSQL database
3. ✅ Import your data
4. ✅ Configure Nginx
5. ✅ Set up SSL
6. ✅ Update DNS to point to your Droplet IP

## Security Checklist

- [ ] Change default SSH port
- [ ] Set up firewall (UFW)
- [ ] Use strong database passwords
- [ ] Keep Strapi and dependencies updated
- [ ] Set up regular backups
- [ ] Configure fail2ban

