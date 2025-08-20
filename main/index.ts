import { app, BrowserWindow } from 'electron';
import * as path from 'path';

// Wrap squirrel handling in platform check
if (process.platform === 'win32') {
      const squirrelStartup = require('electron-squirrel-startup');

      if (squirrelStartup) {
            app.quit();
      }
}

// Handle ICU data issues
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Windows-specific configurations for Electron 35
if (process.platform === 'win32') {
      // Ensure proper DLL loading
      process.env['ELECTRON_RUN_AS_NODE'] = '0';

      // Electron 35 has better native module handling, so we can be less aggressive
      // Only disable the most problematic features
      app.commandLine.appendSwitch('disable-features', 'MediaFoundationVideoCapture');

      // Enable better native module support
      app.commandLine.appendSwitch('enable-features', 'NativeModuleSupport');
}

// Add user-friendly error dialog on Windows crashes
const { dialog } = require('electron');

function createWindow(): void {
      let mainWindow: BrowserWindow | null = null;

      try {
            console.log('Creating browser window...');

            // Create the browser window with minimal configuration to avoid crashes
            mainWindow = new BrowserWindow({
                  width: 1500,
                  height: 1200,
                  show: false, // Don't show until ready
                  webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        // preload: path.join(__dirname, 'preload.js'),
                        webSecurity: false, // Disable for testing
                        allowRunningInsecureContent: true, // Allow for testing
                        experimentalFeatures: false,

                  }
            });

            console.log('Browser window created successfully');

            // Handle window ready to show
            mainWindow.once('ready-to-show', () => {
                  console.log('Window ready to show');
                  if (mainWindow) {
                        mainWindow.show();
                  }
            });

            // Handle window errors gracefully
            mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
                  console.error('Failed to load:', errorDescription, 'at', validatedURL);

                  // Try to load a fallback page
                  if (mainWindow) {
                        mainWindow.loadURL('data:text/html,<html><body><h1>Betzone App</h1><p>Loading...</p></body></html>');
                  }
            });

            // Try to load the HTML file with multiple fallback options
            const fs = require('fs');
            // Expand possiblePaths to include Windows-specific variations
            const possiblePaths = [
                  path.join(__dirname, '../renderer/index.html'),
                  path.join(__dirname, 'renderer/index.html'),
                  path.join(__dirname, '../dist/renderer/index.html'),
                  path.join(__dirname, 'dist/renderer/index.html'),
                  path.join(process.resourcesPath, 'renderer/index.html'), // For packaged apps
                  path.join(app.getAppPath(), 'renderer/index.html')
            ];

            let htmlLoaded = false;
            for (const htmlPath of possiblePaths) {
                  try {
                        if (fs.existsSync(htmlPath)) {
                              console.log('Loading HTML from:', htmlPath);
                              mainWindow.loadFile(htmlPath);
                              htmlLoaded = true;
                              break;
                        }
                  } catch (error) {
                        console.error('Failed to load from:', htmlPath, error);
                  }
            }

            // If no HTML file found, create a basic fallback
            if (!htmlLoaded) {
                  console.log('No HTML file found, creating fallback content');
                  const fallbackHTML = `
                        <html>
                        <head>
                              <title>Betzone Desktop App</title>
                              <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
                                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                                    h1 { color: #333; }
                                    .status { color: #666; }
                              </style>
                        </head>
                        <body>
                              <div class="container">
                                    <h1>Betzone Desktop Application</h1>
                                    <p class="status">Application loaded successfully!</p>
                                    <p>If you see this message, the app is working but the main interface couldn't be loaded.</p>
                              </div>
                        </body>
                        </html>
                  `;

                  mainWindow.loadURL(`data:text/html,${encodeURIComponent(fallbackHTML)}`);
            }

            // Open DevTools in development
            if (process.env['NODE_ENV'] === 'development') {
                  mainWindow.webContents.openDevTools();
            }

            console.log('Window setup completed successfully');

      } catch (error) {
            console.error('Error creating window:', error);
            dialog.showErrorBox('Startup Error', 'Failed to launch Betzone. Please check logs in app folder.');
            app.quit();
            if (error instanceof Error) {
                  console.error('Stack trace:', error.stack);

                  // Write to a log file for debugging
                  try {
                        const fs = require('fs');
                        const logPath = path.join(__dirname, '../error-log.txt');
                        fs.writeFileSync(logPath, `Error at ${new Date().toISOString()}\n${error.stack}\n`);
                  } catch (logError) {
                        console.error('Failed to write error log:', logError);
                  }
            }

            // Don't quit the app, try to show an error window instead
            if (mainWindow) {
                  mainWindow.loadURL('data:text/html,<html><body><h1>Error</h1><p>Failed to load application</p></body></html>');
            }
      }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
      console.log('Electron app is ready, creating window...');
      createWindow();
}).catch((error) => {
      console.error('Failed to initialize app:', error);
      if (error instanceof Error) {
            console.error('Stack trace:', error.stack);

            // Write to a log file for debugging
            const fs = require('fs');
            const logPath = path.join(__dirname, '../init-error-log.txt');
            fs.writeFileSync(logPath, `Init error at ${new Date().toISOString()}\n${error.stack}\n`);
      }

      app.quit();
});

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      if (error instanceof Error) {
            console.error('Stack trace:', error.stack);

            // Write to a log file for debugging
            try {
                  const fs = require('fs');
                  const logPath = path.join(__dirname, '../crash-log.txt');
                  fs.writeFileSync(logPath, `Crash at ${new Date().toISOString()}\n${error.stack}\n`);
            } catch (logError) {
                  console.error('Failed to write crash log:', logError);
            }
      }

      // Don't quit immediately, give the app a chance to recover
      console.log('Attempting to recover from crash...');
});

process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);

      // Write to a log file for debugging
      try {
            const fs = require('fs');
            const logPath = path.join(__dirname, '../rejection-log.txt');
            fs.writeFileSync(logPath, `Rejection at ${new Date().toISOString()}\n${reason}\n`);
      } catch (logError) {
            console.error('Failed to write rejection log:', logError);
      }

      // Don't quit, just log the error
      console.log('Continuing despite unhandled rejection...');
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
            app.quit();
      }
});

app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open
      if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
      }
});

// Add a health check mechanism
setInterval(() => {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length === 0) {
            console.log('No windows found, creating new window...');
            createWindow();
      } else {
            // Check if any window is responsive
            let hasResponsiveWindow = false;
            for (const window of windows) {
                  if (!window.isDestroyed() && window.isVisible()) {
                        hasResponsiveWindow = true;
                        break;
                  }
            }

            if (!hasResponsiveWindow) {
                  console.log('No responsive windows found, creating new window...');
                  createWindow();
            }
      }
}, 10000); // Check every 10 seconds 