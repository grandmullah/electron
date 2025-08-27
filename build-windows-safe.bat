@echo off
echo ========================================
echo BetZone Windows Build Script (Safe Mode)
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if yarn is installed
where yarn >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Yarn is not installed, using npm instead
    set PKG_MANAGER=npm
) else (
    set PKG_MANAGER=yarn
)

echo Using package manager: %PKG_MANAGER%
echo.

REM Clean previous builds
echo Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist out rmdir /s /q out
if exist dist-installer rmdir /s /q dist-installer

REM Install dependencies
echo Installing dependencies...
call %PKG_MANAGER% install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Build TypeScript
echo Building TypeScript files...
call npx tsc -p tsconfig.main.json
if %errorlevel% neq 0 (
    echo ERROR: TypeScript compilation failed
    pause
    exit /b 1
)

REM Build Vite/React
echo Building renderer (React app)...
call npx vite build
if %errorlevel% neq 0 (
    echo ERROR: Vite build failed
    pause
    exit /b 1
)

REM Create directories
echo Creating distribution directories...
if not exist dist\renderer mkdir dist\renderer
if not exist dist\resources mkdir dist\resources

REM Copy files
echo Copying files...
xcopy /s /e /y renderer\*.html dist\renderer\
xcopy /s /e /y renderer\styles dist\renderer\styles\
xcopy /s /e /y resources dist\resources\

REM Fix paths in HTML for Windows
echo Fixing paths for Windows compatibility...
powershell -Command "(Get-Content dist\renderer\index.html) -replace 'src=\"src/', 'src=\"./src/' -replace 'href=\"styles/', 'href=\"./styles/' | Set-Content dist\renderer\index.html"

REM Test the app
echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Testing the app...
echo Press Ctrl+C to stop the test and continue to packaging
echo.
timeout /t 3 >nul
call npx electron .

REM Ask if user wants to package
echo.
set /p PACKAGE="Do you want to create Windows installer? (y/n): "
if /i "%PACKAGE%"=="y" (
    echo Creating Windows installer...
    call npx electron-builder --win --x64
    if %errorlevel% eq 0 (
        echo.
        echo ========================================
        echo Installer created successfully!
        echo Check the dist-installer folder
        echo ========================================
    ) else (
        echo ERROR: Failed to create installer
    )
)

echo.
echo Done!
pause
