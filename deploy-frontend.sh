#!/usr/bin/env bash
# Build frontend and make it live. Nginx serves from front-end/dist.
set -e
cd "$(dirname "$0")/front-end"
npm run build
echo "Frontend built. Nginx serves from front-end/dist — site is up to date."
# Reload nginx so it picks up any changes (optional; static files need no reload)
if command -v sudo &>/dev/null && sudo nginx -t 2>/dev/null; then
  sudo systemctl reload nginx 2>/dev/null && echo "Nginx reloaded." || true
fi
