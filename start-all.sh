#!/usr/bin/env bash
# Start backend (and optionally ensure nginx is running). Use at VPS boot.
# Nginx usually starts automatically; this script starts the app backend in screen.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Start backend (script will skip if already on port 5000)
bash "$ROOT/start-backend.sh"

# Optional: ensure nginx is running (uncomment if needed)
# if command -v systemctl >/dev/null 2>&1; then
#   sudo systemctl start nginx 2>/dev/null || true
# fi

echo "Start-all done."
