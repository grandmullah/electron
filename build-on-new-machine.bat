@echo off
REM Betzone Electron App - Automated Build Script for Windows
REM This script automatically sets up the environment and builds the application

setlocal enabledelayedexpansion

echo 🚀 Betzone Electron App - Automated Build Script
echo ==================================================
echo.

REM Clean up old build artifacts to ensure fresh build
echo [INFO] Cleaning up old build directories...
rmdir /s /q dist 2>nul
rmdir /s /q out 2>nul
rmdir /s /q dist-electron-builder 2>nul
echo [SUCCESS] Cleanup completed

REM Check for internet connection (required for installations)
echo [INFO] Checking internet connection...
ping -n 1 google.com >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No internet connection detected.
    echo Please connect to the internet and restart this script.
    pause
    exit /b 1
) else (
    echo [SUCCESS] Internet connection available
)

REM Check if Node.js is installed
:check_node
set RETRY_COUNT=0
:retry_node_check
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed (Attempt %RETRY_COUNT%/3).
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Download the LTS version (18.x or later recommended)
    echo IMPORTANT: Choose 64-bit installer and add to PATH during setup.
    echo.
    echo After installation, press any key to continue and re-check.
    echo NOTE: If it still fails, close and reopen this terminal window (or restart the script) to update PATH.
    pause
    set /a RETRY_COUNT+=1
    if %RETRY_COUNT% GEQ 3 (
        echo [ERROR] Max retries reached. Please restart the terminal/script after installing Node.js.
        pause
        exit /b 1
    )
    goto :retry_node_check
) else (
    echo [INFO] Node.js is installed
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js: !NODE_VERSION!
    REM Verify Node.js version is 18+ (basic check)
    set NODE_MAJOR=!NODE_VERSION:~1,2!
    if !NODE_MAJOR! LSS 18 (
        echo [WARNING] Node.js version is below 18. Some features may not work.
        echo Consider upgrading to LTS (18.x or later).
        echo Press any key to continue anyway...
        pause
    )
)

REM Check if npm is available
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm not found (should be included with Node.js)
    echo Try reinstalling Node.js.
    pause
    exit /b 1
) else (
    echo [SUCCESS] npm is available
)

REM Check if Yarn is installed
where yarn >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Yarn not found. Installing...
    npm install -g yarn
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Yarn. Check npm permissions/internet.
        pause
        exit /b 1
    )
    echo [SUCCESS] Yarn installed successfully
) else (
    echo [INFO] Yarn is already installed
    for /f "tokens=*" %%i in ('yarn --version') do set YARN_VERSION=%%i
    echo [SUCCESS] Yarn: !YARN_VERSION!
)

echo.
echo [INFO] Installing project dependencies (attempt 1/2)...
yarn install --frozen-lockfile
if %errorlevel% neq 0 (
    echo [WARNING] First attempt failed. Retrying...
    yarn install --frozen-lockfile
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies after retry.
        echo Check internet, yarn cache, or run 'yarn cache clean' manually.
        pause
        exit /b 1
    )
)
echo [SUCCESS] Dependencies installed successfully

echo.
echo [INFO] Building the application...
yarn build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Check for TypeScript errors or missing files.
    pause
    exit /b 1
)
echo [SUCCESS] Application built successfully

echo.
echo [INFO] Creating Windows distributable packages with Electron Forge...
echo [INFO] This may take several minutes...
yarn make:win:installer
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create Windows installer.
    echo Try running 'yarn make:win:installer' manually for detailed errors.
    pause
    exit /b 1
) else (
    echo [SUCCESS] Windows installer created successfully
)

echo.
echo [INFO] Looking for Windows installer packages (Electron Forge)...
echo [INFO] Checking out\make directory...

REM Look for Squirrel installer produced by Electron Forge
set INSTALLER_FOUND=0
for /f "delims=" %%i in ('dir /b /s out\make\squirrel.windows\x64\*.exe 2^>nul') do (
    echo [INFO] Found installer: %%~nxi
    echo [SUCCESS] Starting installer automatically...
    start "" "%%i"
    set INSTALLER_FOUND=1
    goto :installer_done
)

REM Fallback: look for any .exe under out\make
if %INSTALLER_FOUND%==0 (
    for /f "delims=" %%i in ('dir /b /s out\make\*.exe 2^>nul') do (
        echo [INFO] Found installer: %%~nxi
        echo [SUCCESS] Starting installer automatically...
        start "" "%%i"
        set INSTALLER_FOUND=1
        goto :installer_done
    )
)

if %INSTALLER_FOUND%==0 (
    echo [WARNING] No installer found to run automatically.
    echo [INFO] You may need to run 'yarn make:win:installer' to create the installer first.
    echo Check for errors above or verify Electron Forge configuration in package.json.
)

:installer_done

echo.
echo [SUCCESS] 🎉 Build completed successfully!
echo.

echo 📁 Your build artifacts are located in: out\make\
echo.
echo 🚀 To install the application (recommended):
echo    Run the installer in: out\make\squirrel.windows\x64\*.exe
echo.
echo 📦 Portable build (no installer):
echo    ZIP file in: out\make\zip\win32\x64\*.zip
echo.
echo 📦 To create an installer:
echo    yarn make:win:installer
echo.
echo 🔧 Additional commands:
echo    yarn start          - Build and start the app
echo    yarn dev            - Start in development mode
echo    yarn make:win       - Create Windows package
echo    yarn make:win:installer - Create Windows installer
echo    yarn make:win:portable - Create portable Windows app
echo.
echo 🔒 The command prompt will stay open so you can run additional commands.
echo    Type 'exit' and press Enter to close when you're done.
echo.

REM Keep the command prompt open
cmd /k
