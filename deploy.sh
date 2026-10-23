#!/bin/bash

# ModelMart Cloudflare Pages Deployment Script
# Supports deployment by version tag or latest commit

set -e

# Configuration
PROJECT_NAME="modelmart"
BRANCH="main"
DEPLOY_TYPE="${1:-latest}"  # 'latest' or 'tag'
TAG_NAME="${2:-}"

echo "🚀 Starting ModelMart deployment to Cloudflare Pages..."
echo "   Deploy type: $DEPLOY_TYPE"
if [ "$DEPLOY_TYPE" = "tag" ] && [ -n "$TAG_NAME" ]; then
    echo "   Version tag: $TAG_NAME"
fi
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler is not installed. Installing..."
    npm install -D wrangler
fi

# Check if user is logged in
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  You need to log in to Cloudflare first."
    echo "Running: wrangler login"
    wrangler login
fi

# If deploying by tag, checkout the tag
if [ "$DEPLOY_TYPE" = "tag" ]; then
    if [ -z "$TAG_NAME" ]; then
        # Auto-detect latest tag
        TAG_NAME=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
        if [ -z "$TAG_NAME" ]; then
            echo "❌ No tags found. Please create a tag first."
            echo "   Usage: git tag -a v1.0.0 -m 'Release message'"
            exit 1
        fi
        echo "ℹ️  Using latest tag: $TAG_NAME"
    fi

    echo "📦 Checking out tag $TAG_NAME..."
    git checkout "$TAG_NAME"
fi

# Build the project
echo ""
echo "📦 Building the project..."
npm run build

# Get version info
VERSION=$(node -p "require('./package.json').version")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo ""
echo "📋 Deployment Info:"
echo "   Version: $VERSION"
echo "   Commit: $COMMIT_HASH"
echo "   Project: $PROJECT_NAME"
echo "   Branch: $BRANCH"
echo ""

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy dist \
    --project-name=$PROJECT_NAME \
    --branch=$BRANCH \
    --commit-dirty=true \
    --commit-hash=$COMMIT_HASH

# If we checked out a tag, return to original branch
if [ "$DEPLOY_TYPE" = "tag" ]; then
    echo ""
    echo "🔄 Returning to previous branch..."
    git checkout - 2>/dev/null || true
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment Summary:"
echo "   Version: $VERSION"
echo "   Commit: $COMMIT_HASH"
echo "   URL: https://$PROJECT_NAME.pages.dev"
echo "   Custom Domain: https://modelmart.ai (after setup)"
echo ""
echo "📝 Useful commands:"
echo "   - Create new tag: git tag -a v1.1.0 -m 'Release notes'"
echo "   - List tags: git tag -l"
echo "   - Deploy specific tag: ./deploy.sh tag v1.0.0"
echo "   - Deploy latest: ./deploy.sh"
echo ""
