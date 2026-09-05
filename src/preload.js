const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('customify', {
  status: () => ipcRenderer.invoke('status'),
  applyTheme: (theme) => ipcRenderer.invoke('apply-theme', theme),
  restore: () => ipcRenderer.invoke('restore'),
  chooseMedia: () => ipcRenderer.invoke('choose-media'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  saveTheme: (theme) => ipcRenderer.invoke('save-theme-file', theme),
  loadTheme: () => ipcRenderer.invoke('load-theme-file')
});
