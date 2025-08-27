#!/bin/bash

# Script to create a deployment package excluding gitignored files
# This creates a clean zip file that can be transferred to new machines

set -e

# Get the directory where this script is located (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Creating deployment package for Betzone Electron app..."

# Get the project name from package.json (with fallback)
if command -v node >/dev/null 2>&1; then
    PROJECT_NAME=$(node -p "require('./package.json').name")
    VERSION=$(node -p "require('./package.json').version")
else
    # Fallback: try to read package.json manually or use defaults
    if [ -f "package.json" ]; then
        # Simple parsing of package.json without Node.js
        PROJECT_NAME=$(grep '"name"' package.json | head -1 | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
        VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    fi
    
    # Set defaults if parsing failed
    PROJECT_NAME=${PROJECT_NAME:-"betzone-electron"}
    VERSION=${VERSION:-"1.0.0"}
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="${PROJECT_NAME}-${VERSION}-${TIMESTAMP}"

echo "📦 Package name: $PACKAGE_NAME"

# Create a temporary directory for the clean files
TEMP_DIR="./temp-deployment"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "🧹 Creating clean deployment directory..."

# Copy all files except those in .gitignore
# Using rsync to exclude patterns from .gitignore
rsync -av --progress ./ "$TEMP_DIR/" \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='node_modules' \
    --exclude='build' \
    --exclude='test' \
    --exclude='types' \
    --exclude='utils' \
    --exclude='out*' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    --exclude='*.tmp' \
    --exclude='*.temp' \
    --exclude='dist-electron-builder' \
    --exclude='.vscode' \
    --exclude='.idea'

# Remove the temporary directory from the package
rm -rf "$TEMP_DIR/temp-deployment"

echo "📋 Creating deployment package..."

# Create the zip file
zip -r "${PACKAGE_NAME}.zip" "$TEMP_DIR" -x "*.DS_Store" "*/__pycache__/*" "*/node_modules/*"

# Clean up temporary directory
rm -rf "$TEMP_DIR"

echo "✅ Deployment package created: ${PACKAGE_NAME}.zip"
echo "📁 Package size: $(du -h "${PACKAGE_NAME}.zip" | cut -f1)"
echo "📍 Location: $(pwd)/${PACKAGE_NAME}.zip"
echo ""
echo "🎯 Next steps:"
echo "1. Transfer ${PACKAGE_NAME}.zip to the target machine"
echo "2. Extract the zip file"
echo "3. Run the build script: ./build-on-new-machine.sh"
echo ""
echo "🚀 Ready for deployment!"
