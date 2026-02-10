#!/usr/bin/env bash
# Start the backend in a screen session (for use at VPS boot or manually).
# If already running on port 5000, does nothing unless you run restart-backend.sh first.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Optional: skip if already running
if lsof -ti :5000 >/dev/null 2>&1; then
  echo "Backend already running on port 5000. Use restart-backend.sh to restart."
  exit 0
fi

screen -S smbistro-backend -X quit 2>/dev/null || true
sleep 1
screen -dmS smbistro-backend bash -c "cd '$ROOT/back-end' && node ./src/app.js"

echo "Backend started in screen session 'smbistro-backend'."
