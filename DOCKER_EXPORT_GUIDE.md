# Export Strapi Data from Docker

## Quick Start

### 1. Start Strapi in Docker

```bash
# Build and start the container
docker-compose up -d

# Check logs to ensure it's running
docker-compose logs -f strapi
```

### 2. Run the Export Script (CLI Method - Recommended)

```bash
# Make script executable (first time only)
chmod +x scripts/export-from-docker-cli.sh

# Run the export script
./scripts/export-from-docker-cli.sh
```

This will:
- Check if Docker container is running
- Start it if needed
- Export all your data using Strapi CLI
- Copy the export file to your host machine

### 3. Export Data via CLI (Recommended)

**Option A: Export from Docker Container**

```bash
# Export data from the running container
docker exec strapi-app strapi export --no-encrypt -f export-$(date +%Y%m%d)

# Copy the export file from container to host
docker cp strapi-app:/opt/app/export-$(date +%Y%m%d).tar.gz ./export-$(date +%Y%m%d).tar.gz
```

**Option B: Export via Admin Panel (if available)**

1. **Open admin panel**: http://localhost:1337/admin
2. **Generate Transfer Token**:
   - Go to: Settings → Transfer Tokens
   - Click "Generate Transfer Token"
   - Name it and set expiration
   - Copy the token
3. **Export Data** (if Import/Export menu exists):
   - Go to: Settings → Import/Export (or Data Transfer)
   - Click "Export"
   - Download the `.tar.gz` file

### 4. Import to Strapi Cloud

**Option A: Import via CLI (Recommended)**

```bash
# Copy export file to Strapi Cloud (via SSH or file upload)
# Then run in Strapi Cloud:
strapi import -f /path/to/export-YYYYMMDD.tar.gz
```

**Option B: Import via Admin Panel (if available)**

1. Open Strapi Cloud admin panel
2. Go to: Settings → Import/Export (or Data Transfer)
3. Click "Import"
4. Upload your exported file

## Export via CLI (Easiest Method - RECOMMENDED)

The easiest way to export in Strapi v5 is using the CLI command:

```bash
# Use the automated script (recommended)
./scripts/export-from-docker-cli.sh

# Or manually:
# Export from Docker container
docker exec strapi-app npx strapi export --no-encrypt -f export-$(date +%Y%m%d)

# This creates: /opt/app/export-YYYYMMDD.tar.gz in the container

# Copy to host machine
docker cp strapi-app:/opt/app/export-$(date +%Y%m%d).tar.gz ./export-$(date +%Y%m%d).tar.gz

# Verify the file
ls -lh export-*.tar.gz
```

## Alternative: Export via API (If Transfer Tokens Available)

If you have a transfer token from the admin panel:

```bash
# Get your transfer token from: Settings → Transfer Tokens
TRANSFER_TOKEN="your-token-here"

# Export via API
docker exec strapi-app curl -X POST \
  http://localhost:1337/api/transfer/export \
  -H "Authorization: Bearer $TRANSFER_TOKEN" \
  --output /opt/app/export.tar.gz

# Copy file from container to host
docker cp strapi-app:/opt/app/export.tar.gz ./export.tar.gz
```

## Docker Commands Reference

```bash
# Start Strapi
docker-compose up -d

# Stop Strapi
docker-compose down

# View logs
docker-compose logs -f strapi

# Execute command in container
docker exec -it strapi-app sh

# Access database file (if needed)
docker exec strapi-app ls -lh /opt/app/.tmp/data.db

# Backup database from container
docker cp strapi-app:/opt/app/.tmp/data.db ./backups/data.db.backup-$(date +%Y%m%d-%H%M%S)
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Required Strapi secrets
APP_KEYS=key1,key2,key3,key4
JWT_SECRET=your-secret
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-admin-secret
TRANSFER_TOKEN_SALT=your-transfer-salt

# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Server
HOST=0.0.0.0
PORT=1337
```

Generate secrets:
```bash
openssl rand -base64 32  # Run multiple times for APP_KEYS
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs strapi

# Rebuild container
docker-compose build --no-cache
docker-compose up -d
```

### Can't access admin panel

```bash
# Check if container is running
docker ps

# Check if port is accessible
curl http://localhost:1337/admin

# Check container logs
docker-compose logs strapi
```

### Database migration issues

```bash
# Access container shell
docker exec -it strapi-app sh

# Check database file
ls -lh /opt/app/.tmp/data.db

# View migration logs in container logs
docker-compose logs strapi | grep -i migration
```

### Export fails

- Ensure Strapi is fully started (check logs)
- Verify transfer token is valid
- Check file size limits
- Try exporting via admin panel instead of API

## File Locations in Container

- **Database**: `/opt/app/.tmp/data.db`
- **Uploads**: `/opt/app/public/uploads`
- **Data**: `/opt/app/data`
- **Exports**: `/opt/app/export.tar.gz` (if using API)

## Next Steps After Export

1. **Verify export file**:
   ```bash
   ls -lh export*.tar.gz
   ```

2. **Import to Strapi Cloud**:
   - Go to Strapi Cloud admin panel
   - Settings → Import/Export → Import
   - Upload your exported file

3. **Upload media files** (if needed):
   - Media files may be included in export
   - Or upload separately via Media Library

## Complete Workflow

```bash
# 1. Start Docker
docker-compose up -d

# 2. Wait for Strapi to start (check logs)
docker-compose logs -f strapi

# 3. Run export helper
./scripts/export-from-docker.sh

# 4. Follow instructions to export via admin panel
#    http://localhost:1337/admin

# 5. Import to Strapi Cloud
#    (via Strapi Cloud admin panel)
```

## Need Help?

- Docker Compose Docs: https://docs.docker.com/compose/
- Strapi Docker Docs: https://docs.strapi.io/dev-docs/installation/docker
- Data Transfer: https://docs.strapi.io/user-docs/settings/import-export-data

