# 🚀 Betzone Electron App - Quick Start Guide

## 📦 Create Deployment Package (Mac)

```bash
./create-windows-package.sh
```

**Result**: `betzone-windows-build-package_YYYYMMDD_HHMMSS.tar.gz` (≈200KB)

## 🪟 Deploy to Windows Machine

### Prerequisites
- Windows 10/11 (64-bit)
- Node.js 18+ from [https://nodejs.org/](https://nodejs.org/)
- Internet connection

### One-Click Build
1. **Extract** the `.tar.gz` file
2. **Double-click** `CLICK_TO_BUILD.bat`
3. **Wait** for build to complete (5-15 minutes)
4. **Installer launches automatically** ✅

## 📁 What You Get

- **Portable app**: `dist-electron-builder/win-unpacked/Betzone.exe`
- **Windows installer**: `dist-electron-builder/Betzone Setup.exe`
- **Start Menu & Desktop shortcuts** after installation

## 🔧 Alternative Methods

- **PowerShell**: Right-click `CLICK_TO_BUILD.ps1` → "Run with PowerShell"
- **Extract & Build**: Use `EXTRACT_AND_BUILD.bat` for package extraction
- **Manual**: Run `yarn install && yarn build && yarn make:win:installer`

## 📚 Documentation

- **Complete Guide**: `DEPLOYMENT_GUIDE.md`
- **Windows Instructions**: `WINDOWS_BUILD_README.md`
- **Troubleshooting**: See guides for common issues

---

**🎯 Goal**: Windows users can build and install your app with just a double-click!


