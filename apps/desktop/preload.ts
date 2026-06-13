import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('sanctuary', {
  isDesktop: true as const,
  getAutoUpdateEnabled: (): Promise<boolean> =>
    ipcRenderer.invoke('auto-update:get-enabled'),
  setAutoUpdateEnabled: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke('auto-update:set-enabled', enabled),
  checkForUpdates: (): Promise<void> =>
    ipcRenderer.invoke('auto-update:check'),
})
