# Betzone Electron App - Automated Build Script (PowerShell)
# Right-click this file and select "Run with PowerShell" to build and install

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Change to script directory
Set-Location $PSScriptRoot

# Function to keep window open at end
function Keep-Open {
    Write-Host "`nPress Enter to exit..." -ForegroundColor Yellow
    Read-Host
}

# Welcome message
Write-Host "🚀 Betzone Electron App - Automated Build Script" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`nThis script will:" -ForegroundColor White
Write-Host "1. Check/setup Node.js and Yarn" -ForegroundColor White
Write-Host "2. Install dependencies" -ForegroundColor White
Write-Host "3. Build the app" -ForegroundColor White
Write-Host "4. Create installer with Electron Forge" -ForegroundColor White
Write-Host "5. Launch installer automatically" -ForegroundColor White
Write-Host "`nStarting in 3 seconds..." -ForegroundColor White
Start-Sleep -Seconds 3

# Clean up old builds
Write-Host "`n🧹 Cleaning up old build directories..." -ForegroundColor Yellow
Remove-Item -Path "dist", "out", "dist-electron-builder" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleanup complete" -ForegroundColor Green

# Check internet
Write-Host "`n📡 Checking internet connection..." -ForegroundColor Yellow
if (-not (Test-Connection -ComputerName google.com -Count 1 -Quiet)) {
    Write-Host "❌ No internet detected. Please connect and rerun." -ForegroundColor Red
    Keep-Open
    exit 1
}
Write-Host "✅ Internet available" -ForegroundColor Green

# Check Node.js with user prompt loop
Write-Host "`n🔍 Checking for Node.js..." -ForegroundColor Yellow
$nodeInstalled = $false
$retryCount = 0
do {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
        # Check version
        $majorVersion = $nodeVersion.Substring(1,2) -as [int]
        if ($majorVersion -lt 18) {
            Write-Host "⚠️ Warning: Node.js version is below 18. May cause issues." -ForegroundColor Yellow
            Write-Host "Consider upgrading to LTS (18.x+)." -ForegroundColor Yellow
            Write-Host "Press Enter to continue anyway..." -ForegroundColor Yellow
            Read-Host
        }
    } else {
        $retryCount++
        Write-Host "❌ Node.js not found (Attempt $retryCount/3)." -ForegroundColor Red
        Write-Host "Please install from https://nodejs.org/ (LTS 18.x+, 64-bit)." -ForegroundColor Yellow
        Write-Host "After install, press Enter to re-check." -ForegroundColor Yellow
        Write-Host "Tip: Restart this script or PowerShell if it still fails (updates PATH)." -ForegroundColor Yellow
        Read-Host
        if ($retryCount -ge 3) {
            Write-Host "❌ Max attempts reached. Please install Node.js and restart." -ForegroundColor Red
            Keep-Open
            exit 1
        }
    }
} while (-not $nodeInstalled)

# Check/install Yarn
Write-Host "`n🔍 Checking for Yarn..." -ForegroundColor Yellow
$yarnVersion = yarn --version 2>$null
if (-not $yarnVersion) {
    Write-Host "📦 Installing Yarn..." -ForegroundColor Yellow
    npm install -g yarn
    $yarnVersion = yarn --version
}
Write-Host "✅ Yarn: $yarnVersion" -ForegroundColor Green

# Install dependencies with retry
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
$installSuccess = $false
for ($attempt = 1; $attempt -le 2; $attempt++) {
    yarn install --frozen-lockfile
    if ($?) {
        $installSuccess = $true
        break
    }
    Write-Host "⚠️ Attempt $attempt failed. Retrying..." -ForegroundColor Yellow
}
if (-not $installSuccess) {
    Write-Host "❌ Failed to install dependencies. Check internet/yarn cache." -ForegroundColor Red
    Keep-Open
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Build the app
Write-Host "`n🔨 Building the application..." -ForegroundColor Yellow
yarn build
if (-not $?) {
    Write-Host "❌ Build failed. Check for errors above." -ForegroundColor Red
    Keep-Open
    exit 1
}
Write-Host "✅ Build complete" -ForegroundColor Green

# Make installer with Forge
Write-Host "`n📦 Creating installer (Electron Forge)..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor White
yarn make:win:installer
if (-not $?) {
    Write-Host "❌ Make failed. Check package.json config." -ForegroundColor Red
    Keep-Open
    exit 1
}
Write-Host "✅ Installer created" -ForegroundColor Green

# Find and launch installer
Write-Host "`n🔍 Searching for installer..." -ForegroundColor Yellow
$installer = Get-ChildItem -Path "out\make\squirrel.windows\x64" -Filter "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $installer) {
    $installer = Get-ChildItem -Path "out\make" -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
}
if ($installer) {
    Write-Host "✅ Found: $($installer.FullName)" -ForegroundColor Green
    Write-Host "🚀 Launching installer..." -ForegroundColor Green
    Start-Process $installer.FullName
} else {
    Write-Host "⚠️ No installer found. Run 'yarn make:win:installer' manually." -ForegroundColor Yellow
}

# Success message
Write-Host "`n🎉 All done! Build and install complete." -ForegroundColor Green
Write-Host "📁 Outputs in: out\make\" -ForegroundColor White
Write-Host "   - Installer: out\make\squirrel.windows\x64\*.exe" -ForegroundColor White
Write-Host "   - Portable ZIP: out\make\zip\win32\x64\*.zip" -ForegroundColor White

Keep-Open

