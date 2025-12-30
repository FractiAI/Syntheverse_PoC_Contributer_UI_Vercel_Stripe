#!/bin/bash

echo "🔧 Fixing build issues..."

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Clear node_modules and reinstall (fresh install)
echo "📦 Fresh dependency installation..."
rm -rf node_modules package-lock.json
npm install

# Try build again
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Deploying to Vercel..."
    VERCEL_TOKEN="Fd9bCTAseZ8AhTwGMgEL1IbX" npx vercel --prod
    echo "✅ Deployment complete!"
else
    echo "❌ Build still failing. Try:"
    echo "npm run build --verbose"
    echo "Check for memory issues or try on different machine"
fi
