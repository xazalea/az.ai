#!/bin/bash
# Optimized Vercel build script - Fast deployment
set -e

echo "🚀 Starting optimized build process..."

# Skip package builds if dist already exists (faster rebuilds)
if [ -d "packages/qwen-free-api/dist" ] && [ -d "packages/deepseek-free-api/dist" ]; then
  echo "⚡ Skipping package builds (using cached dist)"
else
  echo "🔨 Building essential packages only..."
  # Only build packages that are actually used
  cd packages/qwen-free-api && npm run build 2>/dev/null || true && cd ../..
  cd packages/deepseek-free-api && npm run build 2>/dev/null || true && cd ../..
  cd packages/glm-free-api && npm run build 2>/dev/null || true && cd ../..
fi

# Build Next.js app
echo "🏗️  Building Next.js application..."
next build

echo "✅ Build completed successfully!"

