#!/bin/bash

# Build script for deployment
# This script handles the build process and moves files from dist/public/ 
# to dist/ to match deployment expectations.

echo "[build-deploy] Starting build process..."

# Run the standard build command
echo "[build-deploy] Building frontend with Vite and backend with esbuild..."
npm run build

# Check if the build was successful and files exist
if [ -d "dist/public" ]; then
    echo "[build-deploy] Moving files from dist/public/ to dist/ for deployment..."
    
    # Move all files from dist/public to dist root
    cd dist
    mv public/* .
    rmdir public
    cd ..
    
    echo "[build-deploy] ✅ Build completed successfully!"
    echo "[build-deploy] File structure for deployment:"
    ls -la dist/
else
    echo "[build-deploy] ⚠️  dist/public directory not found. Build may have failed or output location changed."
    exit 1
fi