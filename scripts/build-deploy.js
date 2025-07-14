#!/usr/bin/env node

/**
 * Build script for deployment
 * 
 * This script handles the build process and moves files from dist/public/ 
 * to dist/ to match deployment expectations.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function log(message) {
  console.log(`[build-deploy] ${message}`);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

try {
  log('Starting build process...');
  
  // Run the standard build command
  log('Building frontend with Vite...');
  execSync('vite build', { cwd: rootDir, stdio: 'inherit' });
  
  log('Building backend with esbuild...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { cwd: rootDir, stdio: 'inherit' });
  
  // Check if dist/public exists
  const distPublicPath = path.join(rootDir, 'dist', 'public');
  const distPath = path.join(rootDir, 'dist');
  
  if (fs.existsSync(distPublicPath)) {
    log('Moving files from dist/public/ to dist/ for deployment...');
    
    // Get all files and directories in dist/public
    const items = fs.readdirSync(distPublicPath);
    
    // Copy each item to dist root
    items.forEach(item => {
      const srcPath = path.join(distPublicPath, item);
      const destPath = path.join(distPath, item);
      
      log(`Moving ${item}...`);
      copyRecursive(srcPath, destPath);
    });
    
    // Remove the now-empty dist/public directory
    log('Cleaning up dist/public directory...');
    removeDirectory(distPublicPath);
    
    log('✅ Build completed successfully! Files are now in dist/ for deployment.');
  } else {
    log('⚠️  dist/public directory not found. Build may have failed or output location changed.');
  }
  
} catch (error) {
  console.error('[build-deploy] ❌ Build failed:', error.message);
  process.exit(1);
}