#!/bin/bash

# Create Instrumentation Shell API Repository
# This script creates the complete repository structure for deployment

set -e

REPO_DIR="../Syntheverse-Instrumentation-Shell-API"
CURRENT_DIR=$(pwd)

echo "🚀 Creating Instrumentation Shell API Repository..."

# Create directory structure
mkdir -p "$REPO_DIR/src/app/api/instrumentation/measure"
mkdir -p "$REPO_DIR/src/app/api/instrumentation/verify"
mkdir -p "$REPO_DIR/src/app/api/instrumentation/state-image"
mkdir -p "$REPO_DIR/src/app/api/instrumentation/score"
mkdir -p "$REPO_DIR/src/app/api/instrumentation/status"
mkdir -p "$REPO_DIR/src/utils/auth"
mkdir -p "$REPO_DIR/src/utils/scoring"
mkdir -p "$REPO_DIR/src/utils/omnibeam"
mkdir -p "$REPO_DIR/src/utils/nspfrp"
mkdir -p "$REPO_DIR/src/types"
mkdir -p "$REPO_DIR/docs

echo "✅ Directory structure created"
echo ""
echo "📝 Next steps:"
echo "1. Copy component files to $REPO_DIR"
echo "2. Create API route files"
echo "3. Set up authentication middleware"
echo "4. Initialize git repository"
echo "5. Deploy to Vercel"
echo ""
echo "Repository location: $REPO_DIR"
