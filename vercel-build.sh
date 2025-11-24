#!/bin/bash
# Optimized Vercel build script
# Handles errors gracefully and provides better feedback

set -e

echo "🚀 Starting optimized build process..."

# Step 1: Ensure all packages have build scripts
echo "📋 Checking build scripts..."
node scripts/ensure-build-scripts.js || echo "⚠️  Build script check had warnings"

# Step 2: Build packages (with error tolerance)
echo "🔨 Building packages..."
npm run build:packages:sequential || {
  echo "⚠️  Some packages failed to build, but continuing with Next.js build..."
}

# Step 3: Build Next.js app
echo "🏗️  Building Next.js application..."
next build || {
  echo "❌ Next.js build failed"
  exit 1
}

echo "✅ Build completed successfully!"

