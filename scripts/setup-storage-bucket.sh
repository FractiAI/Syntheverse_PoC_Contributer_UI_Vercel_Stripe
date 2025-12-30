#!/bin/bash

# Setup Supabase Storage Bucket for PoC PDF Files
# 
# This script creates the 'poc-files' storage bucket using the Supabase API
# 
# Requirements:
#   - NEXT_PUBLIC_SUPABASE_URL environment variable
#   - SUPABASE_SERVICE_ROLE_KEY environment variable
#   - curl command
#   - jq command (optional, for pretty JSON output)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BUCKET_NAME="poc-files"

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "Please set these in your .env.local file or export them:"
    echo "  export NEXT_PUBLIC_SUPABASE_URL='your-supabase-url'"
    echo "  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    exit 1
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

echo "📦 Setting up Supabase Storage bucket..."
echo "   Bucket name: ${BUCKET_NAME}"
echo "   Supabase URL: ${SUPABASE_URL}"
echo ""

# Check if bucket exists
echo "🔍 Checking if bucket exists..."
EXISTING_BUCKETS=$(curl -s -X GET \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    "${SUPABASE_URL}/storage/v1/bucket")

if echo "$EXISTING_BUCKETS" | grep -q "\"name\":\"${BUCKET_NAME}\""; then
    echo -e "${GREEN}✅ Bucket '${BUCKET_NAME}' already exists${NC}"
    
    # Update bucket to ensure it's public
    echo "🔄 Updating bucket settings..."
    UPDATE_RESPONSE=$(curl -s -X PATCH \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"public\": true,
            \"file_size_limit\": 52428800,
            \"allowed_mime_types\": [\"application/pdf\"]
        }" \
        "${SUPABASE_URL}/storage/v1/bucket/${BUCKET_NAME}")
    
    if echo "$UPDATE_RESPONSE" | grep -q "error"; then
        echo -e "${YELLOW}⚠️  Warning: Could not update bucket settings${NC}"
    else
        echo -e "${GREEN}✅ Bucket settings updated (public access enabled)${NC}"
    fi
else
    # Create the bucket
    echo "📦 Creating bucket '${BUCKET_NAME}'..."
    
    CREATE_RESPONSE=$(curl -s -X POST \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"${BUCKET_NAME}\",
            \"public\": true,
            \"file_size_limit\": 52428800,
            \"allowed_mime_types\": [\"application/pdf\"]
        }" \
        "${SUPABASE_URL}/storage/v1/bucket")
    
    if echo "$CREATE_RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Failed to create bucket:${NC}"
        echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"
        exit 1
    else
        echo -e "${GREEN}✅ Bucket '${BUCKET_NAME}' created successfully!${NC}"
        echo "   Public access: Enabled"
        echo "   File size limit: 50MB"
        echo "   Allowed MIME types: application/pdf"
    fi
fi

echo ""
echo -e "${GREEN}✨ Storage bucket setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Verify bucket exists in Supabase Dashboard → Storage"
echo "   2. PDF files will be stored at: poc-submissions/{submission_hash}/{filename}"
echo "   3. Files are publicly accessible via the public URL"
echo ""

