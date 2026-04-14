#!/bin/bash
# ── Portainer deploy script ──
# Usage: ./deploy.sh
set -e

cd "$(dirname "$0")"

echo "🐳 Portainer — Deploy"
echo "====================="

# Remove stale container (prevents name conflicts)
echo "🧹 Cleaning up old container..."
docker rm -f ai-portainer 2>/dev/null || true

# Pull latest image & start
echo "🔄 Pulling latest Portainer image..."
docker compose pull

echo "🚀 Starting Portainer..."
docker compose up -d

echo ""
echo "====================="
echo "✅ Portainer is running!"
echo "   https://152.53.210.206:9443"
echo "====================="



