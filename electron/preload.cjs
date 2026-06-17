// Preload script — runs in an isolated context with Node access.
// Exposes a safe IPC bridge to the renderer (Next.js app) so the app
// can respond to native menu items.

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bnbCRM', {
  onToggleTheme: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('menu:toggle-theme', handler)
    return () => ipcRenderer.removeListener('menu:toggle-theme', handler)
  },
  onResetData: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('menu:reset-data', handler)
    return () => ipcRenderer.removeListener('menu:reset-data', handler)
  },
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
})
