# Deployment Guide

## Issue Fixed

The deployment was failing because the build process creates files in `dist/public/` but the deployment system expects them directly in `dist/`. 

### Root Cause
- **Vite config** builds frontend to `dist/public/`
- **Deployment** expects `index.html` directly in `dist/`
- **Server config** expects static files in `server/public/` during development

### Solution Applied

Created a deployment build script that automatically moves files to the correct location after build.

## Deployment Process

### Option 1: Quick Manual Fix (for immediate deployment)

After running `npm run build`, manually move the files:

```bash
cd dist
mv public/* .
rmdir public
```

### Option 2: Automated Build Script (recommended)

Use the provided build script:

```bash
./build-for-deployment.sh
```

This script:
1. Runs `npm run build` (builds frontend to `dist/public/` and backend to `dist/index.js`)
2. Moves all files from `dist/public/` to `dist/`
3. Removes the empty `dist/public/` directory
4. Shows the final file structure

### Expected Final Structure

After the fix, `dist/` should contain:

```
dist/
├── index.html          # Frontend entry point
├── index.js            # Backend bundle
└── assets/            # Frontend assets (CSS, JS, images)
    ├── index-*.css
    ├── index-*.js
    └── *.png
```

### Verification

To verify the build is ready for deployment:

```bash
ls -la dist/
```

You should see `index.html` directly in the `dist/` directory, not nested in `dist/public/`.

## Notes

- The Vite and server configuration files are protected and cannot be modified
- This solution works around the configuration by post-processing the build output
- Both development and production workflows remain unchanged
- Only the final deployment structure is modified

## Future Improvements

If the project configuration becomes modifiable in the future, consider:
1. Updating Vite config to output directly to `dist/`
2. Updating server config to serve from the correct production path
3. Creating a unified build configuration for both development and deployment