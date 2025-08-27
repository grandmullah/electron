#!/bin/bash

# Betzone Electron App - Windows Deployment Package Creator
# Run this on Mac to create a clean package for Windows

echo "🚀 Creating Windows Package"
echo "==========================="

PACKAGE_NAME="betzone-windows-package"
PACKAGE_DIR="$PACKAGE_NAME"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

echo "📋 Copying files..."

# Source code
cp -r main renderer resources "$PACKAGE_DIR/"

# Config
cp package.json yarn.lock tsconfig*.json vite.config.ts "$PACKAGE_DIR/"

# New scripts
cp CLICK_TO_BUILD.bat build-on-new-machine.ps1 "$PACKAGE_DIR/"

# Docs
cp WINDOWS_BUILD_README.md "$PACKAGE_DIR/"
# Update README to reference new PS script
cat > "$PACKAGE_DIR/WINDOWS_BUILD_README.md" << EOF
# Betzone Windows Build Guide

## Quick Start
1. Install Node.js 18+ from https://nodejs.org/
2. Double-click CLICK_TO_BUILD.bat
3. Follow prompts - installer launches auto

## Use PowerShell (Recommended)
Right-click build-on-new-machine.ps1 > Run with PowerShell

## Troubleshooting
- Restart terminal after Node install
- Run as Admin if permissions issue
EOF

echo "🧹 Cleaning..."
find "$PACKAGE_DIR" -name "*dist*" -type d -exec rm -rf {} + 2>/dev/null
find "$PACKAGE_DIR" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
find "$PACKAGE_DIR" -name ".DS_Store" -delete 2>/dev/null

echo "📦 Compressing..."
tar -czf "${PACKAGE_NAME}_${TIMESTAMP}.tar.gz" "$PACKAGE_DIR"

rm -rf "$PACKAGE_DIR"

echo "✅ Done! File: ${PACKAGE_NAME}_${TIMESTAMP}.tar.gz"
echo "Send to Windows, extract, double-click CLICK_TO_BUILD.bat"

