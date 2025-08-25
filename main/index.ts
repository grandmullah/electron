import type { App, BrowserWindow as BrowserWindowType } from 'electron';
import * as path from 'path';

// If this file is executed by plain Node, relaunch under Electron
// so that `require('electron')` provides the runtime APIs.
if (!process.versions || !process.versions.electron) {
      try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { spawnSync } = require('child_process');
            // In a Node context, require('electron') resolves to the Electron binary path
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const electronPath = require('electron');
            const result = spawnSync(electronPath, ['.'], {
                  stdio: 'inherit',
                  env: { ...process.env, ELECTRON_RUN_AS_NODE: '0' },
            });
            process.exit(result.status ?? 0);
      } catch (relaunchError) {
            // eslint-disable-next-line no-console
            console.error('Failed to relaunch under Electron:', relaunchError);
            process.exit(1);
      }
}

// Ensure Electron is not forced to run as Node on Windows (breaks child processes)
if (process.platform === 'win32' && process.env['ELECTRON_RUN_AS_NODE']) {
      try {
            delete process.env['ELECTRON_RUN_AS_NODE'];
      } catch (_e) {
            // ignore
      }
}

// Import Electron only after sanitizing environment variables
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electronModule = require('electron') as typeof import('electron');
const { app, BrowserWindow } = electronModule;

// Keep a global reference of the window object to prevent GC closing it
let mainWindow: BrowserWindowType | null = null;
let isShuttingDown = false;
let healthCheckInterval: NodeJS.Timeout | null = null;

// NSIS installer doesn't need Squirrel handling - removed for NSIS builds

// Handle ICU data issues
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
// Prefer API-based GPU disable over many fragile switches
app.disableHardwareAcceleration();

// Windows-specific configurations for Electron 37
if (process.platform === 'win32') {
      // Ensure proper DLL loading
      if (process.env['ELECTRON_RUN_AS_NODE']) {
            delete process.env['ELECTRON_RUN_AS_NODE'];
      }

      // Keep to minimal, safe flags
      app.commandLine.appendSwitch('disable-features', 'MediaFoundationVideoCapture');
      app.commandLine.appendSwitch('enable-features', 'NativeModuleSupport');
}

// Add user-friendly error dialog on Windows crashes
const { dialog } = electronModule;

// Lightweight debug logger to help diagnose startup issues on user machines
function writeDebugLog(message: string): void {
      try {
            const fs = require('fs');
            const logDir = app.getPath('userData');
            const logPath = path.join(logDir, 'startup-log.txt');
            const line = `[${new Date().toISOString()}] ${message}\n`;
            fs.appendFileSync(logPath, line);

            // Also log to console for debugging
            console.log(`DEBUG: ${message}`);
      } catch (_e) {
            // Ignore logging errors
            console.log(`Failed to write debug log: ${message}`);
      }
}

// Start logging immediately
writeDebugLog('=== APP STARTUP BEGINNING ===');
writeDebugLog('Skipping Squirrel startup check - using NSIS installer');
writeDebugLog(`Platform: ${process.platform}`);
writeDebugLog(`Process arguments: ${JSON.stringify(process.argv)}`);
writeDebugLog(`Working directory: ${process.cwd()}`);
writeDebugLog(`App path: ${app ? app.getAppPath() : 'app not ready'}`);

// Log early exit conditions
process.on('exit', (code) => {
      writeDebugLog(`=== APP EXITING WITH CODE: ${code} ===`);
});

// Additional quit event logging
app.on('will-quit', () => {
      writeDebugLog('App received will-quit event');
      isShuttingDown = true;
      if (healthCheckInterval) {
            clearInterval(healthCheckInterval);
            healthCheckInterval = null;
      }
});

app.on('before-quit', () => {
      writeDebugLog('App received before-quit event');
      isShuttingDown = true;
      if (healthCheckInterval) {
            clearInterval(healthCheckInterval);
            healthCheckInterval = null;
      }
});

async function createWindow(): Promise<void> {

      try {
            console.log('Creating browser window...');
            writeDebugLog('Creating browser window');

            // Create the browser window with failsafe configuration for Windows
            const windowOptions: any = {
                  width: 1500,
                  height: 1200,
                  show: false, // Don't show until ready
                  webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        webSecurity: false,
                        allowRunningInsecureContent: true,
                        experimentalFeatures: false,
                        backgroundThrottling: false, // Prevent background throttling
                        preload: path.join(__dirname, 'preload.js') // Add preload script
                  }
            };

            // Windows-specific window options
            if (process.platform === 'win32') {
                  windowOptions.alwaysOnTop = false;
                  windowOptions.skipTaskbar = false;
                  windowOptions.minimizable = true;
                  windowOptions.closable = true;
                  windowOptions.focusable = true;
                  windowOptions.show = true; // Force show on Windows
            }

            mainWindow = new BrowserWindow(windowOptions);

            // Prevent window from being garbage collected
            (global as any).mainWindow = mainWindow;

            console.log('Browser window created successfully');
            writeDebugLog(`Window created: ${mainWindow ? 'yes' : 'no'}`);


            // Handle window ready to show
            mainWindow.once('ready-to-show', () => {
                  console.log('Window ready to show');
                  writeDebugLog('Window ready-to-show event fired');
                  if (mainWindow) {
                        mainWindow.show();
                        writeDebugLog('Window shown successfully');
                  }
            });

            // Track renderer process events
            mainWindow.webContents.once('dom-ready', () => {
                  writeDebugLog('DOM ready event fired');
            });

            mainWindow.webContents.once('did-finish-load', () => {
                  writeDebugLog('Renderer finished loading successfully');
            });

            // Add more detailed loading lifecycle logs
            mainWindow.webContents.on('did-start-loading', () => {
                  writeDebugLog('WebContents did-start-loading');
            });
            mainWindow.webContents.on('did-stop-loading', () => {
                  writeDebugLog('WebContents did-stop-loading');
            });
            mainWindow.webContents.on('did-frame-finish-load', (_event, isMainFrame) => {
                  writeDebugLog(`WebContents did-frame-finish-load (isMainFrame=${isMainFrame})`);
            });

            mainWindow.webContents.on('render-process-gone', (event, details) => {
                  writeDebugLog(`RENDERER PROCESS GONE: ${details.reason} (exit code: ${details.exitCode})`);

                  // Load a simple fallback when renderer crashes
                  const crashFallback = `
                        <html>
                        <head>
                              <title>Betzone - Renderer Crashed</title>
                              <style>
                                    body { font-family: Arial; padding: 20px; background: #f5f5f5; }
                                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                                    .error { color: #d32f2f; margin-bottom: 20px; }
                                    .info { color: #666; line-height: 1.6; }
                                    button { background: #1976d2; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
                                    button:hover { background: #1565c0; }
                              </style>
                        </head>
                        <body>
                              <div class="container">
                                    <h1>🚨 Betzone - Technical Issue</h1>
                                    <div class="error">
                                          <strong>Renderer Process Crashed</strong><br>
                                          Reason: ${details.reason}<br>
                                          Exit Code: ${details.exitCode}
                                    </div>
                                    <div class="info">
                                          <p>The main application interface encountered a technical issue. This is typically caused by:</p>
                                          <ul>
                                                <li>Missing system dependencies (Visual C++ Redistributable)</li>
                                                <li>Antivirus software blocking the application</li>
                                                <li>Corrupted installation files</li>
                                                <li>System compatibility issues</li>
                                          </ul>
                                          <p><strong>Solutions to try:</strong></p>
                                          <ol>
                                                <li>Restart the application</li>
                                                <li>Run as Administrator</li>
                                                <li>Add Betzone to antivirus whitelist</li>
                                                <li>Reinstall the application</li>
                                          </ol>
                                    </div>
                                    <button onclick="location.reload()">Retry</button>
                              </div>
                        </body>
                        </html>
                  `;

                  if (mainWindow && !mainWindow.isDestroyed()) {
                        // Write fallback to temp file to avoid data URL issues on Windows
                        const fs = require('fs');
                        const path = require('path');
                        const tempDir = app.getPath('temp');
                        const fallbackPath = path.join(tempDir, 'betzone-crash-fallback.html');
                        fs.writeFileSync(fallbackPath, crashFallback);
                        mainWindow.loadFile(fallbackPath);
                        writeDebugLog(`Loaded crash fallback from temp file: ${fallbackPath}`);
                  }
            });

            mainWindow.on('unresponsive', () => {
                  writeDebugLog('Window became unresponsive');
            });

            mainWindow.on('responsive', () => {
                  writeDebugLog('Window became responsive');
            });

            // Handle window errors gracefully
            mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
                  console.error('Failed to load:', errorDescription, 'at', validatedURL);
                  writeDebugLog(`Failed to load: ${errorDescription} at ${validatedURL} (error code: ${errorCode})`);

                  // Try to load a fallback page
                  if (mainWindow) {
                        mainWindow.loadURL('data:text/html,<html><body><h1>Betzone App</h1><p>Loading...</p></body></html>');
                        writeDebugLog('Loaded fallback HTML due to load failure');
                  }
            });

            // Add console message logging from renderer
            mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
                  writeDebugLog(`RENDERER CONSOLE [${level}]: ${message} (${sourceId}:${line})`);
            });

            // Try to load the HTML file with multiple fallback options
            const fs = require('fs');

            // Check if we're in development mode
            const isDev = process.env['NODE_ENV'] === 'development' || !app.isPackaged;

            // Expand possiblePaths to include Windows-specific variations
            const possiblePaths = [
                  // Primary paths for built app
                  path.join(__dirname, '../renderer/index.html'),
                  path.join(__dirname, '../dist/renderer/index.html'),

                  // For packaged apps
                  path.join(process.resourcesPath, 'app.asar', 'dist/renderer/index.html'),
                  path.join(process.resourcesPath, 'app', 'dist/renderer/index.html'),
                  path.join(app.getAppPath(), 'dist/renderer/index.html'),

                  // Windows specific paths
                  path.join(process.cwd(), 'dist/renderer/index.html'),
                  path.join(process.cwd(), 'renderer/index.html'),

                  // Fallback paths
                  path.join(__dirname, 'renderer/index.html'),
                  path.join(__dirname, 'dist/renderer/index.html'),
                  path.join(app.getAppPath(), 'renderer/index.html')
            ];

            let htmlLoaded = false;

            // In development, try to load from dev server first
            if (isDev && process.env['VITE_DEV_SERVER_URL']) {
                  try {
                        writeDebugLog(`Loading from dev server: ${process.env['VITE_DEV_SERVER_URL']}`);
                        await mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
                        htmlLoaded = true;
                  } catch (error) {
                        writeDebugLog(`Failed to load from dev server: ${error}`);
                  }
            }

            // Try file paths
            if (!htmlLoaded) {
                  // Check if window still exists
                  if (!mainWindow || mainWindow.isDestroyed()) {
                        writeDebugLog('ERROR: Window was destroyed before loading HTML');
                        return;
                  }

                  for (const htmlPath of possiblePaths) {
                        writeDebugLog(`Checking HTML path: ${htmlPath}`);
                        try {
                              if (fs.existsSync(htmlPath)) {
                                    console.log('Loading HTML from:', htmlPath);
                                    writeDebugLog(`Loading HTML from: ${htmlPath}`);

                                    try {
                                          // Check window still exists before loading
                                          if (!mainWindow || mainWindow.isDestroyed()) {
                                                writeDebugLog('ERROR: Window destroyed during load attempt');
                                                return;
                                          }

                                          // Use loadFile for better cross-platform compatibility
                                          await mainWindow.loadFile(htmlPath);
                                          htmlLoaded = true;
                                          writeDebugLog(`Successfully loaded HTML from: ${htmlPath}`);
                                          break;
                                    } catch (loadError) {
                                          writeDebugLog(`Failed to loadFile, trying loadURL: ${loadError}`);

                                          // Fallback to file:// URL if loadFile fails
                                          try {
                                                // Properly format file URL for Windows
                                                let fileUrl = htmlPath.replace(/\\/g, '/');
                                                // Handle Windows drive letters
                                                if (process.platform === 'win32' && fileUrl[1] === ':') {
                                                      fileUrl = '/' + fileUrl;
                                                }
                                                fileUrl = 'file://' + fileUrl;

                                                await mainWindow.loadURL(fileUrl);
                                                htmlLoaded = true;
                                                writeDebugLog(`Successfully loaded via URL: ${fileUrl}`);
                                                break;
                                          } catch (urlError) {
                                                writeDebugLog(`Failed to load via URL: ${urlError}`);
                                          }
                                    }
                              }
                        } catch (error) {
                              console.error('Failed to load from:', htmlPath, error);
                              writeDebugLog(`Failed to load from: ${htmlPath} - ${error}`);
                        }
                  }
            }

            // If no HTML file found, create a basic fallback
            if (!htmlLoaded) {
                  console.log('No HTML file found, creating fallback content');
                  writeDebugLog('No HTML file found, using fallback inline HTML');
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

            // Ensure window becomes visible even if 'ready-to-show' doesn't fire
            setTimeout(() => {
                  if (mainWindow && !mainWindow.isVisible()) {
                        writeDebugLog('Forcing window to show after timeout');
                        mainWindow.show();
                        mainWindow.focus();
                  }
            }, 1000); // Give 1 second for normal startup, then force show

            // Force show window immediately for debugging
            setTimeout(() => {
                  if (mainWindow) {
                        writeDebugLog('Force showing window immediately');
                        mainWindow.show();
                        mainWindow.focus();
                        writeDebugLog(`Window visible: ${mainWindow.isVisible()}, minimized: ${mainWindow.isMinimized()}, destroyed: ${mainWindow.isDestroyed()}`);
                  }
            }, 100);

            // Prevent GC from closing the window; clear reference only when closed
            mainWindow.on('closed', () => {
                  writeDebugLog('Main window closed event fired');
                  mainWindow = null;
                  (global as any).mainWindow = null;
            });

            // Log if window closes unexpectedly
            mainWindow.on('close', (event) => {
                  writeDebugLog(`Window is closing, prevented: ${event.defaultPrevented}`);
                  isShuttingDown = true;
            });

            // Open DevTools only in development or if there's an error
            if (isDev || process.env['DEBUG'] === 'true') {
                  mainWindow.webContents.openDevTools({ mode: 'detach' });
                  writeDebugLog('DevTools opened for renderer debugging');
            }

            console.log('Window setup completed successfully');
            writeDebugLog('Window setup completed successfully');

      } catch (error) {
            console.error('Error creating window:', error);
            dialog.showErrorBox('Startup Error', 'Failed to launch Betzone. Please check logs in app folder.');
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

            // Don't quit the app; if no window exists, create a minimal one to show error
            if (!mainWindow) {
                  mainWindow = new BrowserWindow({ width: 800, height: 600, show: true });
            }
            mainWindow.loadURL('data:text/html,<html><body><h1>Error</h1><p>Failed to load application</p></body></html>');
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

      // Keep the app alive; attempt a retry after a short delay
      setTimeout(() => {
            try { createWindow(); } catch (_e) { /* swallow */ }
      }, 500);
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

// Quit when all windows are closed (with logging and safety check)
app.on('window-all-closed', () => {
      writeDebugLog('Window-all-closed event fired');
      if (process.platform !== 'darwin') {
            isShuttingDown = true;
            if (healthCheckInterval) {
                  clearInterval(healthCheckInterval);
                  healthCheckInterval = null;
            }
            writeDebugLog('Quitting app after window-all-closed (Windows/Linux)');
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

// Windows-specific emergency window creator
function createEmergencyWindow(): void {
      if (process.platform === 'win32') {
            try {
                  writeDebugLog('Creating emergency window for Windows');
                  const emergencyWindow = new BrowserWindow({
                        width: 800,
                        height: 600,
                        show: true,
                        alwaysOnTop: true,
                        skipTaskbar: false,
                        webPreferences: {
                              nodeIntegration: false,
                              contextIsolation: true,
                        }
                  });

                  const emergencyHTML = `
                        <html>
                        <head><title>Betzone - Emergency Mode</title></head>
                        <body style="font-family: Arial; padding: 20px; background: #f0f0f0;">
                              <h1>🚨 Betzone Emergency Mode</h1>
                              <p>The main application failed to start properly.</p>
                              <p>This emergency window ensures the app remains visible.</p>
                              <p>Please check the startup logs or contact support.</p>
                              <button onclick="location.reload()">Retry</button>
                        </body>
                        </html>
                  `;

                  emergencyWindow.loadURL(`data:text/html,${encodeURIComponent(emergencyHTML)}`);
                  mainWindow = emergencyWindow; // Update global reference
            } catch (error) {
                  writeDebugLog(`Emergency window creation failed: ${error}`);
            }
      }
}

// Add a health check mechanism with Windows emergency fallback
healthCheckInterval = setInterval(() => {
      if (isShuttingDown) {
            writeDebugLog('Health check skipped because app is shutting down');
            return;
      }
      const windows = BrowserWindow.getAllWindows();
      if (windows.length === 0) {
            console.log('No windows found, creating new window...');
            writeDebugLog('Health check: No windows found, attempting recovery');

            if (process.platform === 'win32') {
                  createEmergencyWindow();
            } else {
                  createWindow();
            }
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
                  writeDebugLog('Health check: No responsive windows, attempting recovery');

                  if (process.platform === 'win32') {
                        createEmergencyWindow();
                  } else {
                        createWindow();
                  }
            }
      }
}, 10000); // Increased to 10 seconds to prevent rapid re-crashes