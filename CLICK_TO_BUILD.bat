@echo off
REM Betzone Electron App - Click to Build Launcher
REM Double-click to start the build process

cd /d "%~dp0"
cls

echo 🚀 Betzone Electron App Builder
echo =================================

echo.
echo Recommended: Use PowerShell for better output.
echo If PowerShell is available, we'll use it.
echo.

REM Check if PowerShell is available
powershell -Command "exit 0" >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ PowerShell detected. Launching improved script...
    powershell -NoProfile -ExecutionPolicy Bypass -File "build-on-new-machine.ps1"
    echo.
    echo 🔒 Press any key to exit...
    pause >nul
) else (
    echo ⚠️ PowerShell not found. Falling back to batch script.
    echo Install PowerShell for better experience.
    echo.
    if exist "build-on-new-machine.bat" (
        call build-on-new-machine.bat
    ) else (
        echo ❌ build-on-new-machine.bat not found!
    )
    echo.
    echo 🔒 Press any key to exit...
    pause >nul
)
