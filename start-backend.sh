#!/bin/bash

# ModelMart Backend Quick Start Script

set -e

echo "🚀 Starting ModelMart Backend Services..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo "⚙️  Creating .env file from example..."
    cp backend/.env.example backend/.env
    echo "✅ Please edit backend/.env with your API keys if needed"
    echo ""
fi

# Start services
echo "📦 Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access points:"
echo "   - Frontend:    http://localhost:5173"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs:    http://localhost:8000/docs"
echo ""
echo "📝 Useful commands:"
echo "   - View logs:       docker-compose logs -f"
echo "   - Stop services:   docker-compose down"
echo "   - Restart:         docker-compose restart"
echo ""
echo "🎉 Happy coding!"
