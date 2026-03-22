#!/bin/bash
# Bayit - Start Script
# Run this once from the RealEstaetMVP folder

echo ""
echo "🏡 Starting Bayit Real Estate App..."
echo ""

# Check node is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install it from https://nodejs.org"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo "✅ Starting Karim AI Advisor (port 3001)..."
node scripts/chat-server.mjs &
CHAT_PID=$!

sleep 2

echo "✅ Starting Bayit UI (port 3000)..."
npm run dev &
UI_PID=$!

echo ""
echo "======================================"
echo "  🏡 Bayit is running!"
echo "  Open: http://localhost:3000"
echo "======================================"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and clean up on exit
trap "kill $CHAT_PID $UI_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
