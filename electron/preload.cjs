const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktopApp: true,
  platform: process.platform,
  onTriggerSync: (callback) => {
    ipcRenderer.on('trigger-sync', () => callback());
  }
});
