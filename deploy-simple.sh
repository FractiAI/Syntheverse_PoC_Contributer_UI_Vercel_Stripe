#!/bin/bash

echo "🚀 Deploying with filename-based PDF extraction..."
echo "This avoids build issues while providing basic functionality"

# Remove problematic pdfreader dependency
echo "📦 Removing pdfreader dependency..."
npm uninstall pdfreader

# Deploy directly to Vercel (build happens on Vercel servers)
echo "🌐 Deploying to Vercel..."
VERCEL_TOKEN="Fd9bCTAseZ8AhTwGMgEL1IbX" npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🎯 Your PDF submissions will now extract text from filenames"
echo "   Example: 'My-Research-Paper.pdf' → 'My Research Paper'"
echo ""
echo "💡 For full PDF text extraction, consider:"
echo "   • Upgrading to Node.js 22+ on your local machine"
echo "   • Using a different PDF library (pdf2text, textract)"
echo "   • Deploying directly to Vercel without local build"
