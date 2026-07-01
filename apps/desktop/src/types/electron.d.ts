export interface SanctuaryDesktopApi {
  isDesktop: true
  getAutoUpdateEnabled: () => Promise<boolean>
  setAutoUpdateEnabled: (enabled: boolean) => Promise<void>
  checkForUpdates: () => Promise<void>
  selectDirectory: () => Promise<string | null>
  writeFileStructure: (
    basePath: string,
    files: Array<{ path: string; content: string | Uint8Array }>,
  ) => Promise<void>
  listFiles: (dirPath: string) => Promise<string[]>
  readFileBase64: (filePath: string) => Promise<string | null>
  getAutoLaunch: () => Promise<boolean>
  setAutoLaunch: (enabled: boolean) => Promise<void>
  // Backup
  getBackupDir: () => Promise<string>
  openBackupDir: (dirPath: string) => Promise<void>
  selectBackupDir: () => Promise<string | null>
  selectBackupFile: () => Promise<string | null>
  readFileText: (filePath: string) => Promise<string | null>
  deleteFile: (filePath: string) => Promise<boolean>
}

declare global {
  interface Window {
    sanctuary?: SanctuaryDesktopApi
  }
}

export {}
