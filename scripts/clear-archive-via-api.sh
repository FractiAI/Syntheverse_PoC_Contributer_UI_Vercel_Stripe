#!/bin/bash
# Script to clear PoC archive via API endpoint
# Usage: ./scripts/clear-archive-via-api.sh [API_URL]
# 
# If API_URL is not provided, defaults to http://localhost:3000
# For production, use: ./scripts/clear-archive-via-api.sh https://syntheverse-poc.vercel.app

API_URL="${1:-http://localhost:3000}"
ENDPOINT="${API_URL}/api/admin/clear-archive"

echo "🗑️  Clearing PoC Archive via API..."
echo "⚠️  WARNING: This will delete ALL PoC submissions, allocations, and logs!"
echo ""
echo "Endpoint: ${ENDPOINT}"
echo ""

# Check if user is authenticated (you'll need to provide auth token or use browser)
echo "Note: This endpoint requires authentication."
echo "You can:"
echo "  1. Use the browser DevTools Network tab while logged in"
echo "  2. Use curl with your session cookie:"
echo "     curl -X DELETE ${ENDPOINT} -H 'Cookie: your-session-cookie'"
echo ""
echo "Or run the script directly: npx tsx scripts/clear-poc-archive.ts"
echo "(requires DATABASE_URL in .env.local)"

