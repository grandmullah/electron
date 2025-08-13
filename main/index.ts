import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow(): void {
      // Create the browser window
      const mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                  nodeIntegration: false,
                  contextIsolation: true,
                  preload: path.join(__dirname, 'preload.js')
            }
      });

      // Load the index.html file
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

      // Open DevTools in development
      if (process.env['NODE_ENV'] === 'development') {
            mainWindow.webContents.openDevTools();
      }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

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