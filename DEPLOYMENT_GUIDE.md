# Betzone Electron App - Complete Deployment Guide

## Overview

This guide explains how to package your Betzone Electron app on Mac and deploy it to Windows machines for building and installation.

## 🍎 On Your Mac (Development Machine)

### 1. Create Windows Deployment Package

Run the deployment script to create a clean package:

```bash
./create-windows-package.sh
```

This will create:
- `betzone-windows-build-package_YYYYMMDD_HHMMSS.tar.gz`
- Contains all necessary files for Windows builds
- Excludes development dependencies and build artifacts

### 2. What Gets Packaged

The script automatically includes:
- ✅ Complete source code (`main/`, `renderer/`, `resources/`)
- ✅ Configuration files (`package.json`, `tsconfig.json`, etc.)
- ✅ Windows build scripts (`.bat` and `.ps1` files)
- ✅ Build documentation
- ❌ `node_modules/` (will be installed on Windows)
- ❌ Build artifacts (`dist/`, `dist-electron-builder/`)
- ❌ Development files (`.log`, `.DS_Store`)

### 3. Send to Windows Machine

Transfer the `.tar.gz` file to your Windows machine via:
- File sharing (OneDrive, Google Drive, etc.)
- USB drive
- Network transfer
- Email (if file size allows)

## 🪟 On Windows Machine (Target)

### Prerequisites

1. **Windows 10/11 (64-bit)**
2. **Node.js 18.x or later** - [Download here](https://nodejs.org/)
3. **Internet connection** for downloading dependencies

### Option 1: One-Click Build (Recommended)

1. **Extract the package**:
   - Right-click the `.tar.gz` file
   - Select "Extract All" (Windows 10+)
   - OR use 7-Zip if installed

2. **Navigate to extracted folder**:
   - Open the extracted `betzone-windows-build-package` folder

3. **Double-click `CLICK_TO_BUILD.bat`**
   - The script will automatically:
     - Check Node.js installation
     - Install Yarn if needed
     - Install dependencies
     - Build the application
     - Create Windows installer
     - **Launch installer automatically**

### Option 2: Extract and Build

1. **Place `EXTRACT_AND_BUILD.bat` in the same folder** as your `.tar.gz` file
2. **Double-click `EXTRACT_AND_BUILD.bat`**
   - This will extract the package and start the build process automatically

### Option 3: Manual Process

1. **Extract the package manually**
2. **Open Command Prompt** in the extracted folder
3. **Run commands manually**:
   ```cmd
   yarn install
   yarn build
   yarn make:win:installer
   ```

## 🔧 Build Scripts Explained

### `CLICK_TO_BUILD.bat`
- **Main launcher script**
- Double-click to start the entire process
- User-friendly interface with progress indicators

### `build-on-new-machine.bat`
- **Core build logic**
- Handles dependency installation
- Manages the build process
- Automatically launches installer

### `CLICK_TO_BUILD.ps1`
- **PowerShell alternative**
- Right-click → "Run with PowerShell"
- Same functionality as batch file

## 📦 What Gets Built

The build process creates:

```
dist-electron-builder/
├── win-unpacked/              # Portable app
│   ├── Betzone.exe           # Main executable
│   ├── resources/            # App resources
│   └── ...                   # Other files
├── Betzone Setup.exe         # Windows installer
└── Betzone-1.0.0.exe        # Alternative installer
```

## 🚀 Installation Process

1. **Build completes** → Installer launches automatically
2. **Follow Windows installer wizard**:
   - Choose installation location
   - Create desktop shortcut
   - Create start menu entry
3. **Launch app** from Start Menu or Desktop

## 🐛 Troubleshooting

### Common Issues

#### Node.js Not Found
```
[ERROR] Node.js is not installed.
```
**Solution**: Install Node.js 18+ from [https://nodejs.org/](https://nodejs.org/)

#### Build Fails
```
[ERROR] Build failed
```
**Solutions**:
- Check internet connection
- Ensure all files are present
- Try running `yarn install` manually first

#### Installer Not Found
```
[WARNING] No installer found to run automatically.
```
**Solutions**:
- Wait for build to complete (may take several minutes)
- Check `dist-electron-builder/` folder for .exe files
- Run `yarn make:win:installer` manually

#### Permission Issues
```
Access denied
```
**Solutions**:
- Run as Administrator
- Check antivirus software
- Ensure write permissions to target directory

### Manual Recovery

If automatic build fails:

1. **Open Command Prompt** in the project folder
2. **Check Node.js**: `node --version`
3. **Check Yarn**: `yarn --version`
4. **Install dependencies**: `yarn install`
5. **Try build**: `yarn build`
6. **Create installer**: `yarn make:win:installer`

## 📋 File Checklist

Ensure these files are in your deployment package:

- [ ] `main/` folder (source code)
- [ ] `renderer/` folder (UI code)
- [ ] `resources/` folder (assets)
- [ ] `package.json` (dependencies)
- [ ] `yarn.lock` (exact versions)
- [ ] `tsconfig.json` (TypeScript config)
- [ ] `vite.config.ts` (build config)
- [ ] `CLICK_TO_BUILD.bat` (main script)
- [ ] `build-on-new-machine.bat` (build logic)
- [ ] `CLICK_TO_BUILD.ps1` (PowerShell alternative)
- [ ] `WINDOWS_BUILD_README.md` (instructions)

## 🔄 Updates and Maintenance

### Updating the App

1. **Make changes** on your Mac
2. **Run deployment script**: `./create-windows-package.sh`
3. **Send new package** to Windows machine
4. **Extract and rebuild** using the same process

### Version Management

- Update version in `package.json`
- Update version in `main/main.ts`
- Create new deployment package
- Distribute to Windows machines

## 📞 Support

### For Windows Users
- Read `WINDOWS_BUILD_README.md`
- Check console output for error messages
- Ensure all prerequisites are met

### For Developers
- Check build logs for specific errors
- Verify package contents before distribution
- Test build process on clean Windows VM

---

**Remember**: The Windows machine needs Node.js and internet access. The build process downloads all dependencies fresh, so the package stays small and clean.



