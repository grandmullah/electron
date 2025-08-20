import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
      // Set app icon based on platform
      const iconPath = path.join(__dirname, '../resources/favicon.ico');

      if (process.platform === 'darwin' && app.dock) {
            app.dock.setIcon(iconPath);
      }

      mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            icon: iconPath,
            webPreferences: {
                  preload: path.join(__dirname, 'preload.js'),
                  nodeIntegration: false,
                  contextIsolation: true,
            },
      });

      // Load app (dev vs prod)
      // if (process.env['NODE_ENV'] === 'development') {
      //       mainWindow.loadURL('http://localhost:3000');
      // } else {
            mainWindow.loadFile(path.join(__dirname, '../renderer/dist/renderer/index.html'));
      // }
});