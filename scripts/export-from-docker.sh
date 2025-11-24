#!/bin/bash

# Export Strapi Data from Docker Container
# This script helps you export data from a Dockerized Strapi instance

set -e

echo "🐳 Strapi Docker Export Helper"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if container is running
CONTAINER_NAME="strapi-app"
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${YELLOW}⚠️  Container '$CONTAINER_NAME' is not running${NC}"
    echo ""
    echo "Starting container..."
    docker-compose up -d
    echo ""
    echo -e "${BLUE}Waiting for Strapi to start...${NC}"
    sleep 10
fi

echo -e "${GREEN}✅ Container is running${NC}"
echo ""

# Get container ID
CONTAINER_ID=$(docker ps -q -f name="$CONTAINER_NAME")

if [ -z "$CONTAINER_ID" ]; then
    echo -e "${RED}❌ Could not find container '$CONTAINER_NAME'${NC}"
    exit 1
fi

echo "Container ID: $CONTAINER_ID"
echo ""

# Check if Strapi is ready
echo -e "${BLUE}Checking if Strapi is ready...${NC}"
if ! docker exec "$CONTAINER_ID" curl -s http://localhost:1337/admin > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Strapi admin panel not ready yet. Waiting...${NC}"
    sleep 5
fi

echo ""
echo "=========================================="
echo "Export Instructions:"
echo "=========================================="
echo ""
echo "1. Open your browser and go to:"
echo -e "   ${BLUE}http://localhost:1337/admin${NC}"
echo ""
echo "2. Log in with your admin credentials"
echo ""
echo "3. Navigate to: ${GREEN}Settings → Transfer Tokens${NC}"
echo ""
echo "4. Click ${GREEN}'Generate Transfer Token'${NC}"
echo "   - Name it (e.g., 'Export to Cloud')"
echo "   - Set expiration (e.g., 7 days)"
echo "   - Click 'Save'"
echo "   - ${YELLOW}Copy the token${NC}"
echo ""
echo "5. Navigate to: ${GREEN}Settings → Import/Export${NC}"
echo ""
echo "6. Click ${GREEN}'Export'${NC} button"
echo ""
echo "7. Wait for export to complete and download the file"
echo ""
echo "=========================================="
echo ""
echo "Alternative: Export via API"
echo "---------------------------"
echo ""
echo "If you have a transfer token, you can export via API:"
echo ""
echo "  docker exec $CONTAINER_ID curl -X POST \\"
echo "    http://localhost:1337/api/transfer/export \\"
echo "    -H 'Authorization: Bearer YOUR_TRANSFER_TOKEN' \\"
echo "    --output /opt/app/export.tar.gz"
echo ""
echo "Then copy the file from container:"
echo ""
echo "  docker cp $CONTAINER_ID:/opt/app/export.tar.gz ./export.tar.gz"
echo ""
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Ready to export!${NC}"
echo ""

