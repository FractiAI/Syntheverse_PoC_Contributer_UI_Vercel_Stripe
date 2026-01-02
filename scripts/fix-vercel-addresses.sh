#!/bin/bash

# Fix Vercel Environment Variables - Remove Trailing Newlines from Contract Addresses
# This script updates the contract addresses in Vercel to ensure they don't have trailing newlines

set -e

VERCEL_TOKEN="${VERCEL_TOKEN:-6oAJ9BkBmd2e9PCTxzBD4EX8}"

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN environment variable is required"
    exit 1
fi

echo "🔧 Fixing contract addresses in Vercel..."
echo ""

# Contract addresses (without newlines)
SYNTH90T_ADDRESS="0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3"
LENS_KERNEL_ADDRESS="0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8"

# Environments to update
ENVIRONMENTS=("production" "preview" "development")

for env in "${ENVIRONMENTS[@]}"; do
    echo "📝 Updating $env environment..."
    
    # Update SYNTH90T_CONTRACT_ADDRESS
    echo "$SYNTH90T_ADDRESS" | vercel env rm SYNTH90T_CONTRACT_ADDRESS "$env" --token="$VERCEL_TOKEN" --yes 2>/dev/null || true
    echo "$SYNTH90T_ADDRESS" | vercel env add SYNTH90T_CONTRACT_ADDRESS "$env" --token="$VERCEL_TOKEN"
    echo "  ✅ Updated SYNTH90T_CONTRACT_ADDRESS"
    
    # Update LENS_KERNEL_CONTRACT_ADDRESS
    echo "$LENS_KERNEL_ADDRESS" | vercel env rm LENS_KERNEL_CONTRACT_ADDRESS "$env" --token="$VERCEL_TOKEN" --yes 2>/dev/null || true
    echo "$LENS_KERNEL_ADDRESS" | vercel env add LENS_KERNEL_CONTRACT_ADDRESS "$env" --token="$VERCEL_TOKEN"
    echo "  ✅ Updated LENS_KERNEL_CONTRACT_ADDRESS"
    
    echo ""
done

echo "✅ All contract addresses updated successfully!"
echo ""
echo "⚠️  Note: Vercel deployments will automatically pick up the new environment variables."
echo "   You may need to trigger a new deployment for changes to take effect."

