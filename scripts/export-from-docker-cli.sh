#!/bin/bash

# Export Strapi Data from Docker Container using CLI
# This is the recommended method for Strapi v5

set -e

echo "🐳 Strapi Docker Export (CLI Method)"
echo "===================================="
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
    sleep 15
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

# Generate export filename with date
EXPORT_FILE="export-$(date +%Y%m%d-%H%M%S)"
EXPORT_PATH="/opt/app/$EXPORT_FILE.tar.gz"

echo -e "${BLUE}Exporting Strapi data...${NC}"
echo ""

# Export using Strapi CLI (via npx)
if docker exec "$CONTAINER_ID" npx strapi export --no-encrypt -f "$EXPORT_FILE" 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Export completed successfully${NC}"
    echo ""
    
    # Check if file exists
    if docker exec "$CONTAINER_ID" test -f "$EXPORT_PATH"; then
        echo -e "${BLUE}Copying export file to host...${NC}"
        
        # Copy file from container to host
        docker cp "$CONTAINER_ID:$EXPORT_PATH" "./$EXPORT_FILE.tar.gz"
        
        if [ -f "./$EXPORT_FILE.tar.gz" ]; then
            FILE_SIZE=$(ls -lh "./$EXPORT_FILE.tar.gz" | awk '{print $5}')
            echo ""
            echo -e "${GREEN}✅ Export file copied successfully!${NC}"
            echo ""
            echo "File: ./$EXPORT_FILE.tar.gz"
            echo "Size: $FILE_SIZE"
            echo ""
            echo "=========================================="
            echo "Next Steps:"
            echo "=========================================="
            echo ""
            echo "1. Import to Strapi Cloud:"
            echo "   - Upload this file to Strapi Cloud"
            echo "   - Run: strapi import -f /path/to/$EXPORT_FILE.tar.gz"
            echo ""
            echo "2. Or import via admin panel (if available):"
            echo "   - Go to Strapi Cloud admin panel"
            echo "   - Settings → Import/Export → Import"
            echo "   - Upload: $EXPORT_FILE.tar.gz"
            echo ""
        else
            echo -e "${RED}❌ Failed to copy export file${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Export file not found at expected location${NC}"
        echo "Checking for export files in container..."
        docker exec "$CONTAINER_ID" ls -lh /opt/app/export*.tar.gz 2>/dev/null || echo "No export files found"
    fi
else
    echo ""
    echo -e "${RED}❌ Export failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if Strapi is fully started:"
    echo "   docker-compose logs strapi"
    echo ""
    echo "2. Try accessing the container shell:"
    echo "   docker exec -it $CONTAINER_ID sh"
    echo "   Then run: strapi export --no-encrypt -f test-export"
    exit 1
fi

