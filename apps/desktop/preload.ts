import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('sanctuary', {
  isDesktop: true,
  getAutoUpdateEnabled: (): Promise<boolean> =>
    ipcRenderer.invoke('auto-update:get-enabled'),
  setAutoUpdateEnabled: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke('auto-update:set-enabled', enabled),
  checkForUpdates: (): Promise<void> => ipcRenderer.invoke('auto-update:check'),
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:select-directory'),
  writeFileStructure: (
    basePath: string,
    files: Array<{ path: string; content: string | Uint8Array }>,
  ): Promise<void> =>
    ipcRenderer.invoke('fs:write-file-structure', { basePath, files }),
  listFiles: (dirPath: string): Promise<string[]> =>
    ipcRenderer.invoke('fs:list-files', dirPath),
  readFileBase64: (filePath: string): Promise<string | null> =>
    ipcRenderer.invoke('fs:read-file-base64', filePath),
})
