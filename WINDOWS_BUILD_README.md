# Betzone Electron App - Windows Build Instructions

## Quick Start (One-Click Build)

1. **Double-click** `CLICK_TO_BUILD.bat` on your Windows machine
2. The script will automatically:
   - Check for Node.js installation
   - Install Yarn if needed
   - Install all dependencies
   - Build the application
   - Create Windows installer packages
   - **Automatically launch the installer**

## What You Need

- **Windows 10/11** (64-bit)
- **Node.js 18.x or later** - Download from [https://nodejs.org/](https://nodejs.org/)
- **Internet connection** for downloading dependencies

## Build Process

The build process will create:
- **Portable app** in `dist-electron-builder/win-unpacked/`
- **Windows installer** (.exe) in `dist-electron-builder/`
- **ZIP package** for distribution

## Manual Commands (if needed)

If you prefer to run commands manually:

```bash
# Install dependencies
yarn install

# Build the app
yarn build

# Create Windows installer
yarn make:win:installer

# Create portable package
yarn make:win:portable

# Create ZIP package
yarn make:win
```

## Troubleshooting

### Node.js not found
- Install Node.js from [https://nodejs.org/](https://nodejs.org/)
- Choose LTS version (18.x or later)
- Restart your computer after installation

### Build fails
- Ensure you have a stable internet connection
- Try running `yarn install` manually first
- Check that all files are present in the project directory

### Installer not found
- The build process may take several minutes
- Wait for the "Build completed successfully" message
- Check the `dist-electron-builder/` folder for .exe files

## File Structure After Build

```
dist-electron-builder/
├── win-unpacked/          # Portable app folder
│   └── Betzone.exe       # Main executable
├── Betzone Setup.exe      # Windows installer
└── Betzone-1.0.0.exe     # Alternative installer
```

## Running the App

- **After installation**: Use Start Menu or Desktop shortcut
- **Portable version**: Double-click `Betzone.exe` in `win-unpacked/` folder
- **Uninstall**: Use Windows "Add or Remove Programs" or Control Panel

## Support

If you encounter issues:
1. Check that all required files are present
2. Ensure Node.js is properly installed
3. Try running the build commands manually
4. Check the console output for specific error messages


