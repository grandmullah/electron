#!/bin/bash

# Betzone Electron App - Click to Build Launcher
# Double-click this file to automatically build the application

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Clear the terminal
clear

echo "🚀 Welcome to Betzone Electron App Builder!"
echo "============================================="
echo ""
echo "This script will automatically:"
echo "• Install Node.js (if needed)"
echo "• Install Yarn (if needed)"
echo "• Install all dependencies"
echo "• Build the application"
echo "• Create distributable packages"
echo "• Create and run installer automatically"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Check if the build script exists
if [ -f "./build-on-new-machine.sh" ]; then
    echo "✅ Found build script. Starting automated build process..."
    echo ""
    
    # Make sure the script is executable
    chmod +x ./build-on-new-machine.sh
    
    # Run the build script
    ./build-on-new-machine.sh
    
    echo ""
    echo "🎉 Build process completed!"
    echo ""
    echo "✅ Your application has been built successfully!"
    echo "📁 Built files are in: dist-electron-builder/"
    echo ""
    echo "🚀 To run the application:"
    echo "   ./dist-electron-builder/mac-arm64/Betzone.app"
    echo ""
    echo "📦 To create an installer later:"
    echo "   yarn make"
    echo ""
    echo "🔒 This window will stay open. Close it manually when you're done."
    echo "   (You can also type 'exit' and press Enter to close)"
    echo ""
    # Keep the shell open
    exec $SHELL
else
    echo "❌ Build script not found!"
    echo "Please ensure build-on-new-machine.sh is in the same directory."
    echo ""
    echo "🔒 This window will stay open. Close it manually when you're done."
    echo "   (You can also type 'exit' and press Enter to close)"
    echo ""
    # Keep the shell open
    exec $SHELL
fi
