#!/usr/bin/env bash
# Restart the backend: kill process on port 5000, then start in a screen session.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Kill existing process on port 5000
pid=$(lsof -ti :5000 2>/dev/null || true)
if [ -n "$pid" ]; then
  kill $pid 2>/dev/null || true
  sleep 2
fi

# Close existing screen session if any, then start backend in screen
screen -S smbistro-backend -X quit 2>/dev/null || true
sleep 1
screen -dmS smbistro-backend bash -c "cd '$ROOT/back-end' && node ./src/app.js"

echo "Backend restarted in screen session 'smbistro-backend'."
