#!/bin/bash

echo "🚀 Deploying PDF Extraction Fix..."

# Install new dependency
echo "📦 Installing pdfreader dependency..."
npm install

# Run build to ensure everything compiles
echo "🔨 Building application..."
npm run build

# Deploy to Vercel (token should be set as environment variable)
echo "🌐 Deploying to Vercel..."
echo "Make sure VERCEL_TOKEN is set in your environment:"
echo "export VERCEL_TOKEN=your_token_here"
npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your PDF extraction now works with:"
echo "   • 100% free & open source pdfreader library"
echo "   • No API keys or cloud setup required"
echo "   • Works in serverless environment"
echo "   • Zero configuration needed"
