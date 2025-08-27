@echo off
REM Betzone Electron App - Extract and Build Launcher
REM Use this if you received a .tar.gz package

echo 🚀 Betzone Electron App - Extract and Build
echo ============================================
echo.

REM Check if 7-Zip is available (for extracting .tar.gz files)
where 7z >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] 7-Zip not found. Checking for alternative extraction methods...
    
    REM Check if tar is available (Windows 10+ has built-in tar)
    where tar >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] No extraction tool found.
        echo.
        echo Please install 7-Zip from https://7-zip.org/
        echo OR use Windows built-in tar (Windows 10+)
        echo.
        echo After installation, restart this script.
        pause
        exit /b 1
    ) else (
        echo [SUCCESS] Using Windows built-in tar
        set EXTRACT_CMD=tar
        set EXTRACT_ARGS=-xzf
    )
) else (
    echo [SUCCESS] 7-Zip found
    set EXTRACT_CMD=7z
    set EXTRACT_ARGS=x
)

echo.
echo [INFO] Looking for package files...
set PACKAGE_FOUND=0

REM Look for .tar.gz files
for /f "delims=" %%i in ('dir /b *.tar.gz 2^>nul') do (
    echo [INFO] Found package: %%i
    set PACKAGE_FILE=%%i
    set PACKAGE_FOUND=1
    goto :extract_package
)

REM Look for .tar files
if %PACKAGE_FOUND%==0 (
    for /f "delims=" %%i in ('dir /b *.tar 2^>nul') do (
        echo [INFO] Found package: %%i
        set PACKAGE_FILE=%%i
        set EXTRACT_CMD=tar
        set EXTRACT_ARGS=-xf
        set PACKAGE_FOUND=1
        goto :extract_package
    )
)

if %PACKAGE_FOUND%==0 (
    echo [ERROR] No package files found!
    echo.
    echo Please ensure you have one of these files in the current directory:
    echo • .tar.gz package file
    echo • .tar package file
    echo.
    pause
    exit /b 1
)

:extract_package
echo.
echo [INFO] Extracting package: %PACKAGE_FILE%
echo [INFO] This may take a moment...

if "%EXTRACT_CMD%"=="7z" (
    %EXTRACT_CMD% %EXTRACT_ARGS% "%PACKAGE_FILE%"
) else (
    %EXTRACT_CMD% %EXTRACT_ARGS% "%PACKAGE_FILE%"
)

if %errorlevel% neq 0 (
    echo [ERROR] Failed to extract package
    pause
    exit /b 1
)

echo [SUCCESS] Package extracted successfully!

echo.
echo [INFO] Looking for extracted directory...
for /d %%i in (*) do (
    if not "%%i"=="%~n0" (
        echo [INFO] Found extracted directory: %%i
        cd "%%i"
        goto :start_build
    )
)

echo [ERROR] Could not find extracted directory
pause
exit /b 1

:start_build
echo.
echo [INFO] Changed to directory: %CD%
echo [INFO] Starting build process...

REM Check if the build script exists
if exist "CLICK_TO_BUILD.bat" (
    echo ✅ Found build script. Starting automated build process...
    echo.
    
    REM Run the build script
    call CLICK_TO_BUILD.bat
) else (
    echo ❌ Build script not found!
    echo Please ensure CLICK_TO_BUILD.bat is in the extracted directory.
    echo.
    pause
    exit /b 1
)






