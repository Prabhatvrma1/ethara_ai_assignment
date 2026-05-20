#!/bin/bash
set -e

echo "Starting Ethara local development"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js 20 or newer."
  exit 1
fi

npm run install:all

cleanup() {
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  if [ -n "$CLIENT_PID" ]; then kill "$CLIENT_PID" 2>/dev/null || true; fi
}

trap cleanup EXIT

npm run dev:server &
SERVER_PID=$!

sleep 2

npm run dev:client &
CLIENT_PID=$!

echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000/api"
echo "Press Ctrl+C to stop both servers."

wait
