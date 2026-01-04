#!/bin/bash
# Check Grok API logs from evaluation failures
# This script queries the debug API endpoint to see what Grok is returning

API_URL="${1:-https://syntheverse-poc.vercel.app}"
SUBMISSION_HASH="${2:-}"

echo "🔍 Checking Grok API responses from evaluation failures..."
echo "API URL: $API_URL"
echo ""

if [ -n "$SUBMISSION_HASH" ]; then
    echo "📋 Fetching logs for submission: $SUBMISSION_HASH"
    curl -s "${API_URL}/api/debug/evaluation-logs?hash=${SUBMISSION_HASH}&limit=10" | jq '.'
else
    echo "📋 Fetching recent evaluation logs (including failures)..."
    curl -s "${API_URL}/api/debug/evaluation-logs?limit=10" | jq '.'
fi

echo ""
echo "💡 To check a specific submission, run:"
echo "   ./scripts/check-grok-logs.sh [API_URL] [SUBMISSION_HASH]"
echo ""
echo "💡 Example:"
echo "   ./scripts/check-grok-logs.sh https://syntheverse-poc.vercel.app f60269526a222b07677cfc85399e54aa05b64ec4db088029ae76de0e5e71019b"

