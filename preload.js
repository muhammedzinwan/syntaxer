const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Send search query to main process and get results
  searchCommand: (query) => ipcRenderer.invoke('search-command', query),
  
  // Send signal to close/hide app
  close: () => ipcRenderer.send('close-app'),
  
  // Listen for clear-contents event
  onClearContents: (callback) => ipcRenderer.on('clear-contents', () => callback())
});
