declare global {
      interface Window {
            pageManager: {
                  navigateTo: (page: string) => void;
                  getAvailablePages: () => string[];
                  getCurrentPage: () => any;
            };
            electronAPI?: {
                  sendMessage: (message: string) => void;
                  onMessage: (callback: (message: string) => void) => void;
                  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
                  writeExcelFile: (filePath: string, buffer: ArrayBuffer) => Promise<{ success: boolean; error?: string }>;
            };
      }
}

export { }; 