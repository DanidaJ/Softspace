#!/bin/bash
# Softspace VPS Deployment Script
# Run this on your VPS in /root/softspace

set -e

echo "🚀 Deploying Softspace..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Create .env with your production values first."
    exit 1
fi

echo "✅ .env file found"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || true

# Cleanup old images
echo "🧹 Cleaning up old images..."
echo "   Removing old softspace-client image..."
docker rmi softspace-client:latest -f 2>/dev/null || true
echo "   Removing old softspace-server image..."
docker rmi softspace-server:latest -f 2>/dev/null || true
echo "   Pruning dangling images..."
docker image prune -f

# Load new images
echo "📦 Loading new Docker images..."
if [ -f softspace-client.tar ]; then
    docker load -i softspace-client.tar
    echo "✅ Client image loaded"
else
    echo "⚠️ softspace-client.tar not found, skipping..."
fi

if [ -f softspace-server.tar ]; then
    docker load -i softspace-server.tar
    echo "✅ Server image loaded"
else
    echo "⚠️ softspace-server.tar not found, skipping..."
fi

# Start containers
echo "🐳 Starting containers..."
docker compose up -d

# Wait for containers to be healthy
echo "⏳ Waiting for containers to start..."
sleep 5

# Check status
echo "📊 Container status:"
docker ps | grep softspace

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
if docker exec softspace-server curl -s localhost:8000/health | grep -q "healthy"; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️ Backend health check failed. Check logs:"
    echo "   docker logs softspace-server"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧹 Cleaning up tar files..."
rm -f softspace-client.tar softspace-server.tar
echo ""
echo "📋 Next steps:"
echo "1. Reload Nginx: cd /root/nginx && docker compose restart"
echo "2. Visit: https://softspace.danidajay.com"
echo ""
echo "📜 View logs:"
echo "   docker logs -f softspace-server"
echo "   docker logs -f softspace-client"
