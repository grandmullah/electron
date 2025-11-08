import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
      sendMessage: (message: string) => ipcRenderer.send('message', message),
      onMessage: (callback: (message: string) => void) => {
            ipcRenderer.on('message', (_, message) => callback(message));
      },
      showSaveDialog: (options: Electron.SaveDialogOptions) => {
            return ipcRenderer.invoke('show-save-dialog', options);
      },
      writeExcelFile: (filePath: string, buffer: ArrayBuffer) => {
            return ipcRenderer.invoke('write-excel-file', filePath, buffer);
      }
});