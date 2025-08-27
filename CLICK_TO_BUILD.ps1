# Betzone Electron App - PowerShell Build Script
# Right-click this file and select "Run with PowerShell" to build the application

Write-Host "🚀 Welcome to Betzone Electron App Builder!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "This script will automatically:" -ForegroundColor White
Write-Host "• Check for Node.js installation" -ForegroundColor White
Write-Host "• Install Yarn (if needed)" -ForegroundColor White
Write-Host "• Install all dependencies" -ForegroundColor White
Write-Host "• Build the application" -ForegroundColor White
Write-Host "• Create distributable packages" -ForegroundColor White
Write-Host "• Create and run installer automatically" -ForegroundColor White
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Download the LTS version (18.x or later)" -ForegroundColor Yellow
    Write-Host "After installation, restart this script." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Yarn is installed
try {
    $yarnVersion = yarn --version 2>$null
    if ($yarnVersion) {
        Write-Host "✅ Yarn is installed: $yarnVersion" -ForegroundColor Green
    } else {
        throw "Yarn not found"
    }
} catch {
    Write-Host "📦 Installing Yarn..." -ForegroundColor Yellow
    try {
        npm install -g yarn
        Write-Host "✅ Yarn installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Yarn" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Installing project dependencies..." -ForegroundColor Yellow
try {
    yarn install --frozen-lockfile
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔨 Building the application..." -ForegroundColor Yellow
try {
    yarn build
    Write-Host "✅ Application built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Creating Windows distributable packages..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor White

try {
    yarn make:win:installer
    Write-Host "✅ Windows installer created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to create Windows installer, trying alternative method..." -ForegroundColor Yellow
    try {
        yarn make:win
        Write-Host "✅ Windows package created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create Windows package" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "🔍 Looking for Windows installer packages..." -ForegroundColor Yellow

# Look for installer in dist-electron-builder
$installerFound = $false
$installerPath = $null

if (Test-Path "dist-electron-builder") {
    $installers = Get-ChildItem "dist-electron-builder" -Filter "*.exe" -ErrorAction SilentlyContinue
    if ($installers) {
        $installer = $installers[0]
        $installerPath = $installer.FullName
        Write-Host "✅ Found installer: $($installer.Name)" -ForegroundColor Green
        $installerFound = $true
    }
}

# Look for installer in out directory (Electron Forge)
if (-not $installerFound -and (Test-Path "out")) {
    $installers = Get-ChildItem "out" -Filter "*.exe" -ErrorAction SilentlyContinue
    if ($installers) {
        $installer = $installers[0]
        $installerPath = $installer.FullName
        Write-Host "✅ Found installer: $($installer.Name)" -ForegroundColor Green
        $installerFound = $true
    }
}

if ($installerFound) {
    Write-Host "🚀 Starting installer automatically..." -ForegroundColor Green
    Start-Process $installerPath
    Write-Host "✅ Installer started! Follow the installation wizard." -ForegroundColor Green
} else {
    Write-Host "⚠️  No installer found to run automatically." -ForegroundColor Yellow
    Write-Host "You may need to run 'yarn make:win:installer' to create the installer first." -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Your built application is located in: dist-electron-builder\" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To run the application:" -ForegroundColor White
Write-Host "   dist-electron-builder\win-unpacked\Betzone.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 To create an installer:" -ForegroundColor White
Write-Host "   yarn make:win:installer" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Additional commands:" -ForegroundColor White
Write-Host "   yarn start          - Build and start the app" -ForegroundColor Cyan
Write-Host "   yarn dev            - Start in development mode" -ForegroundColor Cyan
Write-Host "   yarn make:win       - Create Windows package" -ForegroundColor Cyan
Write-Host "   yarn make:win:installer - Create Windows installer" -ForegroundColor Cyan
Write-Host "   yarn make:win:portable - Create portable Windows app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Yellow
Read-Host






