#!/bin/bash

cd "$(dirname "$0")"
clear

echo "📦 Betzone Package Creator"
echo "=========================="

echo "Creating Windows package in 3s..."
sleep 3

if [ -f "./create-windows-package.sh" ]; then
    chmod +x ./create-windows-package.sh
    ./create-windows-package.sh
    echo "🎉 Complete! Check for .tar.gz file."
else
    echo "❌ Script not found!"
fi

echo "Press Enter to close..."
read
